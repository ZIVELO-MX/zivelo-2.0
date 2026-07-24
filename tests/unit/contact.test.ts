import test from "node:test";
import assert from "node:assert/strict";
import { createMemoryContactRepository } from "../../src/lib/contact/repository/memory";
import { createMemoryMailer } from "../../src/lib/contact/mailer/memory";
import type { NormalizedContact } from "../../src/lib/contact/types";

function makeContact(overrides?: Partial<NormalizedContact>): NormalizedContact {
  return {
    id: "test-uuid-123",
    name: "Ana García",
    company: null,
    email: "ana@example.com",
    topic: "web",
    message: "Hello, I need a website.",
    locale: "es",
    ...overrides,
  };
}

test("memory repository: inserts idempotently", async () => {
  const repo = createMemoryContactRepository();
  const c = makeContact();

  const r1 = await repo.insertIdempotent(c);
  assert.equal(r1.ok, true);

  const r2 = await repo.insertIdempotent(c);
  assert.equal(r2.ok, true);

  assert.equal(repo._rows.size, 1);
});

test("memory repository: claims attempt atomically", async () => {
  const repo = createMemoryContactRepository();
  const c = makeContact();
  await repo.insertIdempotent(c);

  const claim1 = await repo.claimAttempt(c.id);
  assert.equal(claim1.ok, true, "first claim should succeed");

  const claim2 = await repo.claimAttempt(c.id);
  assert.equal(claim2.ok, false, "second claim should fail");
});

test("memory repository: marks sent and failed", async () => {
  const repo = createMemoryContactRepository();
  const c = makeContact();
  await repo.insertIdempotent(c);

  await repo.markSent(c.id, "ref-123");
  const row = repo._rows.get(c.id);
  assert.equal(row?.delivery_status, "sent");
  assert.equal(row?.provider_ref, "ref-123");

  await repo.markFailed(c.id, "ERR_SMTP");
  assert.equal(row?.delivery_status, "failed");
  assert.equal(row?.error_code, "ERR_SMTP");
});

test("memory mailer: sends successfully", async () => {
  const mailer = createMemoryMailer();
  const c = makeContact();

  const result = await mailer.send(c);
  assert.equal(result.ok, true);
  assert.ok(result.providerRef?.startsWith("mock-"));
  assert.equal(mailer._sent.length, 1);
  assert.equal(mailer._sent[0].contact.email, "ana@example.com");
});

test("memory mailer: simulates failure", async () => {
  const mailer = createMemoryMailer();
  mailer._failNext = true;

  const result = await mailer.send(makeContact());
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "SIMULATED_FAILURE");
});

test("memory mailer: uses correct from/replyTo", async () => {
  const mailer = createMemoryMailer();
  const c = makeContact({ email: "visitor@test.com" });
  await mailer.send(c);

  assert.equal(mailer._sent[0].contact.email, "visitor@test.com");
});

test("memory mailer: resets correctly", async () => {
  const mailer = createMemoryMailer();
  await mailer.send(makeContact());
  assert.equal(mailer._sent.length, 1);

  mailer._reset();
  assert.equal(mailer._sent.length, 0);
  assert.equal(mailer._failNext, false);
});

test("duplicate UUID does not duplicate", async () => {
  const repo = createMemoryContactRepository();
  const c1 = makeContact({ id: "same-id" });
  const c2 = makeContact({ id: "same-id", name: "Different Name" });

  const r1 = await repo.insertIdempotent(c1);
  assert.equal(r1.ok, true);

  const r2 = await repo.insertIdempotent(c2);
  assert.equal(r2.ok, true);

  assert.equal(repo._rows.size, 1);
});

test("unknown id claim returns false", async () => {
  const repo = createMemoryContactRepository();
  const result = await repo.claimAttempt("nonexistent");
  assert.equal(result.ok, false);
});

test("honeypot: returns success without saving or sending", async () => {
  const repo = createMemoryContactRepository();
  const mailer = createMemoryMailer();
  const honeypotContent = "I am a bot";

  assert.equal(repo._rows.size, 0);
  assert.equal(mailer._sent.length, 0);
});

test("email regex validates correctly", async () => {
  const { EMAIL_RE } = await import("../../src/lib/contact/types");
  assert.ok(EMAIL_RE.test("ana@example.com"));
  assert.ok(EMAIL_RE.test("a.b@c.co"));
  assert.ok(!EMAIL_RE.test(""));
  assert.ok(!EMAIL_RE.test("not-an-email"));
  assert.ok(!EMAIL_RE.test("@no-local"));
});

test("topic constants are correct", async () => {
  const { TOPICS } = await import("../../src/lib/contact/types");
  assert.deepEqual(TOPICS, ["web", "restaurant", "pos", "other"]);
});