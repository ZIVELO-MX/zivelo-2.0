import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const API_ORIGIN = "https://zipform.zivelo.dev";
const PROJECT_ID = "project-web-corporativa";
const MISSION_LINE = /^\s*(?:Misión|Mision|Mission):\s*(WEB-[0-9]{4})\s*$/gimu;

export function extractMissionDisplayId(body) {
  const matches = [...String(body || "").matchAll(MISSION_LINE)].map((match) => match[1].toUpperCase());

  if (matches.length === 0) return null;
  if (matches.length > 1) {
    throw new Error("PR description must contain exactly one 'Misión: WEB-XXXX' line");
  }

  return matches[0];
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
  const displayId = extractMissionDisplayId(process.env.PR_BODY);
  if (!displayId) {
    console.log("No completed 'Misión: WEB-XXXX' field in PR description; skipping screenshots");
    await writeOutput("skip", "true");
    return;
  }

  const token = process.env.ZIPFORM_TOKEN;
  if (!token) throw new Error("ZIPFORM_TOKEN is not set");

  const missionId = await resolveMissionId(displayId, token);
  console.log(`Resolved ${displayId} to mission ${missionId}`);
  await writeOutput("skip", "false");
  await writeOutput("display_id", displayId);
  await writeOutput("mission_id", missionId);
}

const isEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntrypoint) {
  main().catch((error) => {
    console.error(`Mission resolution failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
