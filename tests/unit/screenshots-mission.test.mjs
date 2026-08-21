import test from "node:test";
import assert from "node:assert/strict";
import {
  extractMissionDisplayId,
  extractScreenshotDecision,
  extractScreenshotProfiles,
  resolveMissionId,
} from "../../scripts/screenshots/resolve-mission.mjs";

test("extracts the structured mission field from the PR description", () => {
  assert.equal(extractMissionDisplayId("## Misión de Zipform\n\nMisión ID: WEB-0004"), "WEB-0004");
  assert.equal(extractMissionDisplayId("Mission ID: web-0016"), "WEB-0016");
});

test("ignores identifiers outside the structured mission field", () => {
  assert.equal(extractMissionDisplayId("Fixes WEB-0004\n\nMisión: WEB-XXXX"), null);
  assert.equal(extractMissionDisplayId("No mission for this PR"), null);
});

test("rejects multiple structured mission fields", () => {
  assert.throws(
    () => extractMissionDisplayId("Misión ID: WEB-0004\nMission ID: WEB-0016"),
    /exactly one mission ID/,
  );
});

test("uses the screenshots checkbox as the source of truth", () => {
  assert.equal(extractScreenshotDecision("Misión ID: WEB-0021\n- [x] No requiere capturas"), false);
  assert.equal(extractScreenshotDecision("Misión ID: WEB-0021\n- [x] Requiere capturas"), true);
  assert.equal(extractScreenshotDecision("Misión ID: WEB-0021"), null);
});

test("rejects conflicting screenshot checkboxes", () => {
  assert.throws(
    () => extractScreenshotDecision("- [x] Requiere capturas\n- [x] No requiere capturas"),
    /exactly one screenshot option/,
  );
});

test("parses known versioned screenshot profiles", () => {
  assert.deepEqual(
    extractScreenshotProfiles("Perfiles de capturas: admin, login"),
    ["admin", "login"],
  );
  assert.deepEqual(
    extractScreenshotProfiles("Perfil(es) de capturas: admin"),
    ["admin"],
  );
});

test("keeps an empty screenshot profile field empty", () => {
  assert.deepEqual(
    extractScreenshotProfiles("Perfil(es) de capturas:\n\n## Validación"),
    [],
  );
});

test("rejects unknown or repeated screenshot profiles", () => {
  assert.throws(
    () => extractScreenshotProfiles("Perfiles de capturas: admin, tablet"),
    /Unknown screenshot profile\(s\): tablet/,
  );
  assert.throws(
    () => extractScreenshotProfiles("Perfiles de capturas: admin\nPerfiles de capturas: login"),
    /exactly one screenshot profile field/,
  );
});

test("requires a profile when screenshots are requested", () => {
  assert.throws(() => {
    const profiles = extractScreenshotProfiles("Misión ID: WEB-0024\n- [x] Requiere capturas");
    if (profiles.length === 0) {
      throw new Error("PR requests screenshots but does not include a screenshot profile");
    }
  }, /does not include a screenshot profile/);
});

test("resolves the exact display ID in the corporate website project", async () => {
  const missionId = await resolveMissionId("WEB-0004", "token", async (url, init) => {
    assert.equal(url.searchParams.get("projectId"), "project-web-corporativa");
    assert.equal(init.headers.Authorization, "Bearer token");
    return Response.json({ data: [{ displayId: "WEB-0004", id: "mission-uuid" }] });
  });

  assert.equal(missionId, "mission-uuid");
});

test("fails when Zipform rejects the lookup", async () => {
  await assert.rejects(
    resolveMissionId("WEB-0004", "token", async () => new Response("unauthorized", { status: 401 })),
    /Mission lookup failed \(401\)/,
  );
});

test("fails when the mission does not exist", async () => {
  await assert.rejects(
    resolveMissionId("WEB-9999", "token", async () => Response.json({ data: [] })),
    /was not found/,
  );
});
