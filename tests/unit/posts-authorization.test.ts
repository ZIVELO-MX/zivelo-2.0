import assert from "node:assert/strict";
import test from "node:test";

import { authorizePostMutation } from "../../src/lib/posts/authorization";

test("post authorization rejects a missing session without querying Supabase", async () => {
  let called = false;
  const result = await authorizePostMutation(null, async () => {
    called = true;
    return { data: null, error: null };
  });

  assert.deepEqual(result, {
    authorized: false,
    code: "UNAUTHENTICATED",
    message: "Tu sesión expiró. Inicia sesión de nuevo.",
  });
  assert.equal(called, false);
});

test("post authorization normalizes and accepts an admin email", async () => {
  let receivedEmail = "";
  const result = await authorizePostMutation(
    "  Admin@Zivelo.dev ",
    async (email) => {
      receivedEmail = email;
      return { data: { id: "admin-id" }, error: null };
    },
  );

  assert.deepEqual(result, { authorized: true });
  assert.equal(receivedEmail, "admin@zivelo.dev");
});

test("post authorization rejects a user outside the admin allowlist", async () => {
  const result = await authorizePostMutation("intruder@example.com", async () => ({
    data: null,
    error: null,
  }));

  assert.equal(result.authorized, false);
  if (!result.authorized) assert.equal(result.code, "FORBIDDEN");
});

test("post authorization maps and safely logs a Supabase failure", async () => {
  const events: unknown[] = [];
  const result = await authorizePostMutation(
    "admin@example.com",
    async () => ({
      data: null,
      error: { code: "PGRST000", message: "Database unavailable" },
    }),
    (event) => events.push(event),
  );

  assert.deepEqual(result, {
    authorized: false,
    code: "DATABASE_ERROR",
    message: "No se pudo verificar tu acceso. Inténtalo de nuevo.",
  });
  assert.deepEqual(events, [
    {
      operation: "posts.authorize",
      category: "database",
      providerCode: "PGRST000",
      providerMessage: "Database unavailable",
    },
  ]);
  assert.equal(JSON.stringify(events).includes("admin@example.com"), false);
});
