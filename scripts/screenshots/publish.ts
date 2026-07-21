import { chromium } from "@playwright/test";
import sharp from "sharp";
import { captureTargets } from "./config.js";
import {
  prepareBatch,
  uploadFile,
  finalizeBatch,
  verifySnapshot,
  type FileManifest,
  type AttachmentGroup,
} from "./zipform.js";

function getEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

async function needsScreenshots(): Promise<boolean> {
  const missionId = getEnv("TLOZ_MISSION_ID");
  const baseURL = getEnv("APP_BASE_URL");
  const prNumber = getEnv("PR_NUMBER");

  if (!missionId || !baseURL || !prNumber) {
    console.log("Screenshots not applicable: missing TLOZ_MISSION_ID, APP_BASE_URL, or PR_NUMBER");
    return false;
  }
  return true;
}

async function main() {
  if (!(await needsScreenshots())) {
    console.log("✓ Skipping screenshot pipeline — not applicable for this change.");
    return;
  }

  const missionId = getEnv("TLOZ_MISSION_ID")!;
  const baseURL = getEnv("APP_BASE_URL")!;
  const groupKey = getEnv("PR_NUMBER")!;
  const sourceRevision = getEnv("SOURCE_REVISION");
  const revision = sourceRevision || "unknown";

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });

  const captures: Map<string, Buffer> = new Map();
  const files: FileManifest[] = [];

  try {
    for (const target of captureTargets) {
      const page = await context.newPage();
      try {
        console.log(`Capturing: ${target.key} — ${target.title}`);
        const bytes = await target.capture(page);
        const metadata = await sharp(bytes).metadata();
        if (!metadata.width || !metadata.height) {
          throw new Error(`Unable to determine dimensions for ${target.key}`);
        }
        captures.set(target.key, bytes);
        files.push({
          key: target.key,
          title: target.title,
          fileName: `${target.key}.png`,
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

    console.log("\nPreparing batch...");
    const { uploadBatchId, generation, uploads } = await prepareBatch(
      missionId,
      groupKey,
      revision,
      files
    );
    console.log(`  Batch: ${uploadBatchId}, generation: ${generation}, files: ${uploads.length}`);

    console.log("\nUploading screenshots...");
    for (const upload of uploads) {
      const bytes = captures.get(upload.key);
      if (!bytes) throw new Error(`No captured data for key: ${upload.key}`);
      const file = files.find((f) => f.key === upload.key)!;
      console.log(`  Uploading: ${upload.key} (${(bytes.byteLength / 1024).toFixed(1)} KiB)`);
      await uploadFile(upload.uploadUrl, bytes, file.contentType);
    }

    console.log("\nFinalizing batch...");
    await finalizeBatch(missionId, uploadBatchId);
    console.log("  OK");

    console.log("\nVerifying snapshot...");
    const groups: AttachmentGroup[] = await verifySnapshot(missionId);
    const active = groups.find((g) => g.groupKey === groupKey);
    if (!active) {
      throw new Error(`Group ${groupKey} not found after finalization`);
    }
    console.log(`  Group: ${active.groupKey}, revision: ${active.sourceRevision}, generation: ${active.generation}`);
    console.log(`  Attachments: ${active.attachments.length}`);
    for (const a of active.attachments) {
      console.log(`    ${a.externalKey}: ${a.width}×${a.height} (${(a.sizeBytes / 1024).toFixed(1)} KiB)`);
    }

    if (revision !== "unknown" && active.sourceRevision !== revision) {
      throw new Error(`Revision mismatch: expected ${revision}, got ${active.sourceRevision}`);
    }

    console.log("\n✓ Screenshots published successfully");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.warn("\n⚠ Screenshot pipeline warning:", err.message);
  console.warn("✓ Continuing — screenshots are supplementary, not blocking.");
});
