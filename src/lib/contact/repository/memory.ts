import type { ContactRepository } from "../repository";
import type { NormalizedContact, DeliveryStatus } from "../types";

export function isTestEnv(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.__TEST__ === "true" ||
    process.env.PLAYWRIGHT_TEST === "true"
  );
}

interface MemoryRow {
  id: string;
  delivery_status: DeliveryStatus;
  delivery_attempts: number;
  provider_ref?: string;
  error_code?: string;
}

export function createMemoryContactRepository(): ContactRepository & {
  _rows: Map<string, MemoryRow>;
  _reset: () => void;
} {
  const rows = new Map<string, MemoryRow>();

  return {
    _rows: rows,

    _reset() {
      rows.clear();
    },

    async insertIdempotent(contact: NormalizedContact) {
      if (rows.has(contact.id)) {
        return { ok: true };
      }
      rows.set(contact.id, {
        id: contact.id,
        delivery_status: "pending",
        delivery_attempts: 0,
      });
      return { ok: true };
    },

    async claimAttempt(id: string) {
      const row = rows.get(id);
      if (!row) return { ok: false };
      if (row.delivery_status !== "pending" || row.delivery_attempts !== 0) {
        return { ok: false };
      }
      row.delivery_status = "sending";
      row.delivery_attempts = 1;
      return { ok: true };
    },

    async markSent(id: string, providerRef: string) {
      const row = rows.get(id);
      if (!row) return;
      row.delivery_status = "sent";
      row.provider_ref = providerRef;
    },

    async markFailed(id: string, errorCode: string) {
      const row = rows.get(id);
      if (!row) return;
      row.delivery_status = "failed";
      row.error_code = errorCode;
    },
  };
}