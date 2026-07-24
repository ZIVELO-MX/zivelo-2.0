/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServiceClient } from "../../supabase/service";

function db() {
  return (createServiceClient() as any).from("contact_submissions");
}

export function createSupabaseContactRepository() {
  return {
    async insertIdempotent(contact: {
      id: string;
      name: string;
      company: string | null;
      email: string;
      topic: string;
      message: string;
      locale: string;
    }) {
      const d = db();
      const { error } = await d.upsert(
        {
          id: contact.id,
          name: contact.name,
          company: contact.company,
          email: contact.email,
          topic: contact.topic,
          message: contact.message,
          locale: contact.locale,
          delivery_status: "pending",
          delivery_attempts: 0,
        },
        { onConflict: "id", ignoreDuplicates: false }
      );
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },

    async claimAttempt(id: string) {
      const d = db();
      const { error } = await d
        .update({
          delivery_status: "sending",
          delivery_attempts: 1,
          delivery_attempted_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("delivery_status", "pending")
        .eq("delivery_attempts", 0);
      if (error) return { ok: false };
      return { ok: true };
    },

    async markSent(id: string, providerRef: string) {
      const d = db();
      await d
        .update({
          delivery_status: "sent",
          provider_ref: providerRef,
          email_sent_at: new Date().toISOString(),
        })
        .eq("id", id);
    },

    async markFailed(id: string, errorCode: string) {
      const d = db();
      await d
        .update({
          delivery_status: "failed",
          error_code: errorCode,
        })
        .eq("id", id);
    },
  };
}