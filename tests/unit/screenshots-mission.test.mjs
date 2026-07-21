import test from "node:test";
import assert from "node:assert/strict";
import {
  extractMissionDisplayId,
  resolveMissionId,
} from "../../scripts/screenshots/resolve-mission.mjs";

test("extracts the structured mission field from the PR description", () => {
  assert.equal(extractMissionDisplayId("## Misión de Zipform\n\nMisión: WEB-0004"), "WEB-0004");
  assert.equal(extractMissionDisplayId("Mission: web-0016"), "WEB-0016");
});

test("ignores identifiers outside the structured mission field", () => {
  assert.equal(extractMissionDisplayId("Fixes WEB-0004\n\nMisión: WEB-XXXX"), null);
  assert.equal(extractMissionDisplayId("No mission for this PR"), null);
});

test("rejects multiple structured mission fields", () => {
  assert.throws(
    () => extractMissionDisplayId("Misión: WEB-0004\nMission: WEB-0016"),
    /exactly one/,
  );
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
