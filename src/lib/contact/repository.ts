import type { NormalizedContact } from "./types";

export interface ContactRepository {
  insertIdempotent(contact: NormalizedContact): Promise<{ ok: boolean; error?: string }>;
  claimAttempt(id: string): Promise<{ ok: boolean }>;
  markSent(id: string, providerRef: string): Promise<void>;
  markFailed(id: string, errorCode: string): Promise<void>;
}