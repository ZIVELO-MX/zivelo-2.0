import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const API_ORIGIN = "https://zipform.zivelo.dev";
const PROJECT_ID = "project-web-corporativa";
const MISSION_LINE = /^\s*(?:Misión\s+ID|Mision\s+ID|Mission\s+ID|Misión|Mision|Mission):\s*(WEB-[0-9]{4})\s*$/gimu;
const SCREENSHOTS_REQUIRED = /^\s*-\s*\[x\]\s+Requiere capturas\s*$/gimu;
const SCREENSHOTS_NOT_REQUIRED = /^\s*-\s*\[x\]\s+No requiere capturas\s*$/gimu;
const PROFILE_LINE = /^\s*(?:Perfil(?:es)?|Perfil\(es\)) de capturas:\s*(.+?)\s*$/gimu;
const KNOWN_PROFILES = new Set(["public", "login", "admin"]);

export function extractMissionDisplayId(body) {
  const matches = [...String(body || "").matchAll(MISSION_LINE)].map((match) => match[1].toUpperCase());
  const uniqueMatches = [...new Set(matches)];

  if (uniqueMatches.length === 0) return null;
  if (uniqueMatches.length > 1) {
    throw new Error("PR description must contain exactly one mission ID");
  }

  return uniqueMatches[0];
}

export function extractScreenshotDecision(body) {
  const text = String(body || "");
  const requiresScreenshots = [...text.matchAll(SCREENSHOTS_REQUIRED)].length;
  const doesNotRequireScreenshots = [...text.matchAll(SCREENSHOTS_NOT_REQUIRED)].length;

  if (requiresScreenshots > 1 || doesNotRequireScreenshots > 1 || (requiresScreenshots && doesNotRequireScreenshots)) {
    throw new Error("PR description must select exactly one screenshot option");
  }

  if (requiresScreenshots) return true;
  if (doesNotRequireScreenshots) return false;
  return null;
}

export function extractScreenshotProfiles(body) {
  const matches = [...String(body || "").matchAll(PROFILE_LINE)];
  if (matches.length > 1) {
    throw new Error("PR description must contain exactly one screenshot profile field");
  }
  if (matches.length === 0) return [];

  const profiles = matches[0][1]
    .split(/[\s,]+/)
    .map((profile) => profile.trim().toLowerCase())
    .filter(Boolean);
  const uniqueProfiles = [...new Set(profiles)];
  const unknown = uniqueProfiles.filter((profile) => !KNOWN_PROFILES.has(profile));
  if (unknown.length) {
    throw new Error(`Unknown screenshot profile(s): ${unknown.join(", ")}`);
  }
  if (uniqueProfiles.length === 0) {
    throw new Error("PR description must include at least one screenshot profile");
  }
  return uniqueProfiles;
}

export async function resolveMissionId(displayId, token, fetchImpl = fetch) {
  const url = new URL("/api/v1/missions", API_ORIGIN);
  url.searchParams.set("projectId", PROJECT_ID);
  url.searchParams.set("limit", "100");

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Mission lookup failed (${response.status}): ${details}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.data)) {
    throw new Error("Mission lookup returned an invalid response");
  }

  const mission = payload.data.find((candidate) => candidate.displayId === displayId);
  if (!mission?.id) {
    throw new Error(`Mission ${displayId} was not found in ${PROJECT_ID}`);
  }

  return mission.id;
}

async function writeOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) throw new Error("GITHUB_OUTPUT is not set");
  await appendFile(outputPath, `${name}=${value}\n`, "utf8");
}

async function main() {
  const body = process.env.PR_BODY;
  const screenshotDecision = extractScreenshotDecision(body);
  const profiles = extractScreenshotProfiles(body);

  if (screenshotDecision === false) {
    console.log("No screenshots requested by PR checklist; skipping screenshots");
    await writeOutput("skip", "true");
    return;
  }

  const displayId = extractMissionDisplayId(body);
  if (!displayId) {
    if (screenshotDecision === true) {
      throw new Error("PR requests screenshots but does not include a mission ID");
    }
    console.log("No mission ID in PR description; skipping screenshots");
    await writeOutput("skip", "true");
    return;
  }

  if (screenshotDecision !== true) {
    throw new Error("PR description must select exactly one screenshot option");
  }
  if (profiles.length === 0) {
    throw new Error("PR requests screenshots but does not include a screenshot profile");
  }

  const token = process.env.ZIPFORM_TOKEN;
  if (!token) throw new Error("ZIPFORM_TOKEN is not set");

  const missionId = await resolveMissionId(displayId, token);
  console.log(`Resolved ${displayId} to mission ${missionId}`);
  await writeOutput("skip", "false");
  await writeOutput("display_id", displayId);
  await writeOutput("mission_id", missionId);
  await writeOutput("profile", profiles.join(","));
}

const isEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntrypoint) {
  main().catch((error) => {
    console.error(`Mission resolution failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
