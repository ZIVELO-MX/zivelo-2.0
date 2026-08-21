import { chromium } from "@playwright/test";
import { encode } from "next-auth/jwt";
import sharp from "sharp";
import {
  captureKey,
  getCaptureProfile,
  getViewport,
  preparePage,
  type CaptureProfileName,
} from "./config.js";
import {
  prepareBatch,
  uploadFile,
  finalizeBatch,
  verifySnapshot,
  type FileManifest,
} from "./zipform.js";

function getEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

function requestedProfiles(): CaptureProfileName[] {
  const value = getEnv("SCREENSHOT_PROFILE");
  if (!value) return [];
  return [...new Set(value.split(",").map((profile) => profile.trim().toLowerCase()).filter(Boolean))] as CaptureProfileName[];
}

async function addAdminSession(context: import("@playwright/test").BrowserContext) {
  const secret = getEnv("AUTH_SECRET");
  if (!secret) throw new Error("AUTH_SECRET is required for the admin screenshot profile");
  const email = getEnv("SCREENSHOT_ADMIN_EMAIL") || "benjamin.rodriguez@zivelo.dev";
  const cookieName = "next-auth.session-token";
  const token = await encode({
    secret,
    token: { sub: `screenshot-${email}`, name: "Screenshot admin", email },
  });
  await context.addCookies([
    {
      name: cookieName,
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    },
  ]);
}

async function publishProfile(
  browser: import("@playwright/test").Browser,
  profileName: CaptureProfileName,
  missionId: string,
  baseURL: string,
  groupKey: string,
  revision: string,
) {
  const profile = getCaptureProfile(profileName);
  const captures = new Map<string, Buffer>();
  const files: FileManifest[] = [];

  for (const viewportName of profile.viewports) {
    for (const theme of profile.themes) {
      const context = await browser.newContext({
        baseURL,
        viewport: getViewport(viewportName),
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
      });
      if (profile.requiresAuth) await addAdminSession(context);

      for (const target of profile.targets) {
        const page = await context.newPage();
        const key = captureKey(profile.name, target, theme, viewportName);
        try {
          console.log(`Capturing: ${key} — ${target.title}`);
          await preparePage(context, page, theme, target.path);
          const bytes = await page.screenshot({ type: "png", animations: "disabled", fullPage: true });
          const metadata = await sharp(bytes).metadata();
          if (!metadata.width || !metadata.height) throw new Error(`Unable to determine dimensions for ${key}`);
          captures.set(key, bytes);
          files.push({
            key,
            title: `${target.title} · ${theme} · ${viewportName}`,
            fileName: `${key}.png`,
            contentType: "image/png",
            sizeBytes: bytes.byteLength,
            width: metadata.width,
            height: metadata.height,
          });
          console.log(`  OK: ${(bytes.byteLength / 1024).toFixed(1)} KiB, ${metadata.width}×${metadata.height}`);
        } finally {
          await page.close();
        }
      }
      await context.close();
    }
  }

  const { uploadBatchId, generation, uploads } = await prepareBatch(missionId, groupKey, revision, files);
  console.log(`Batch ${groupKey}: ${uploadBatchId}, generation ${generation}, files ${uploads.length}`);
  for (const upload of uploads) {
    const bytes = captures.get(upload.key);
    if (!bytes) throw new Error(`No captured data for key: ${upload.key}`);
    const file = files.find((candidate) => candidate.key === upload.key)!;
    await uploadFile(upload.uploadUrl, bytes, file.contentType);
  }
  await finalizeBatch(missionId, uploadBatchId);
  const groups = await verifySnapshot(missionId);
  const active = groups.find((group) => group.groupKey === groupKey);
  if (!active) throw new Error(`Group ${groupKey} not found after finalization`);
  if (revision !== "unknown" && active.sourceRevision !== revision) {
    throw new Error(`Revision mismatch for ${groupKey}: expected ${revision}, got ${active.sourceRevision}`);
  }
  console.log(`✓ Published ${active.attachments.length} screenshots for ${groupKey}`);
}

async function main() {
  const missionId = getEnv("TLOZ_MISSION_ID");
  const baseURL = getEnv("APP_BASE_URL");
  const profiles = requestedProfiles();
  if (!missionId || !baseURL || profiles.length === 0) {
    console.log("✓ Skipping screenshot pipeline — missing mission, base URL, or profile.");
    return;
  }

  const revision = getEnv("SOURCE_REVISION") || "unknown";
  const groupPrefix = getEnv("SCREENSHOT_GROUP_KEY") || "screenshots";
  const browser = await chromium.launch({ headless: true });
  try {
    for (const profile of profiles) {
      await publishProfile(browser, profile, missionId, baseURL, `${groupPrefix}-${profile}`, revision);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("\n✗ Pipeline failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
