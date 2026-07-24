import type { NormalizedContact } from "./types";

export interface ContactMailer {
  send(contact: NormalizedContact): Promise<{
    ok: boolean;
    providerRef?: string;
    errorCode?: string;
  }>;
}