import type { ContactMailer } from "../mailer";
import type { NormalizedContact } from "../types";

export type SentRecord = {
  contact: NormalizedContact;
  providerRef: string;
  timestamp: Date;
};

export type MemoryMailer = ContactMailer & {
  _sent: SentRecord[];
  _reset: () => void;
  _failNext: boolean;
};

export function createMemoryMailer(): MemoryMailer {
  const sent: SentRecord[] = [];
  let failNext = false;

  return {
    _sent: sent,
    _reset() {
      sent.length = 0;
      failNext = false;
    },

    get _failNext() {
      return failNext;
    },
    set _failNext(v: boolean) {
      failNext = v;
    },

    async send(contact: NormalizedContact) {
      if (failNext) {
        return { ok: false, errorCode: "SIMULATED_FAILURE" };
      }
      const providerRef = `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sent.push({ contact, providerRef, timestamp: new Date() });
      return { ok: true, providerRef };
    },
  };
}