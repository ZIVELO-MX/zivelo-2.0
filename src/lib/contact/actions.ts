"use server";

import type { NormalizedContact, ContactResult, Topic } from "./types";
import { TOPICS, LIMITS, EMAIL_RE } from "./types";
import { createSupabaseContactRepository } from "./repository/supabase";
import { createZohoMailer } from "./mailer/zoho";

function normalize(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

function validate(
  fd: FormData
): { ok: true; contact: NormalizedContact } | { ok: false; result: ContactResult } {
  const id = normalize(fd.get("f-id") as string);
  const localeRaw = normalize(fd.get("f-locale") as string);
  const locale = localeRaw === "en" ? "en" : "es";

  const name = normalize(fd.get("f-name") as string);
  const companyRaw = normalize(fd.get("f-company") as string);
  const company = companyRaw || null;
  const email = normalize((fd.get("f-email") as string) || "").toLowerCase();
  const topicRaw = normalize(fd.get("f-topic") as string);
  const message = normalize(fd.get("f-msg") as string);

  const t = (es: string, en: string) => (locale === "en" ? en : es);

  const errors: Record<string, string> = {};

  if (!id) {
    errors._form = t("Error del servidor. Recarga la página.", "Server error. Reload the page.");
    return { ok: false, result: { success: false, errors, message: errors._form } };
  }

  if (!name || name.length > LIMITS.nameMax) {
    errors.name = t("Ingresa tu nombre.", "Please enter your name.");
  }

  if (!email || !EMAIL_RE.test(email) || email.length > LIMITS.emailMax) {
    errors.email = t("Ingresa un correo válido.", "Please enter a valid email address.");
  }

  if (!topicRaw || !TOPICS.includes(topicRaw as Topic)) {
    errors.topic = t("Selecciona un tema.", "Please select a topic.");
  }

  if (!message || message.length > LIMITS.messageMax) {
    errors.message = t("Escribe un mensaje breve.", "Please write a short message.");
  }

  if (Object.keys(errors).length > 0) {
    const msg = t("Corrige los campos señalados.", "Fix the highlighted fields.");
    return { ok: false, result: { success: false, errors, message: msg } };
  }

  return {
    ok: true,
    contact: {
      id,
      name,
      company,
      email,
      topic: topicRaw as Topic,
      message,
      locale,
    },
  };
}

export async function submitContact(
  _prevState: ContactResult,
  formData: FormData
): Promise<ContactResult> {
  const localeRaw = normalize(formData.get("f-locale") as string);
  const locale = localeRaw === "en" ? "en" : "es";
  const t = (es: string, en: string) => (locale === "en" ? en : es);

  const honeypot = normalize(formData.get("f-website") as string);
  if (honeypot) {
    return { success: true, message: t("Mensaje enviado.", "Message sent.") };
  }

  const validated = validate(formData);
  if (!validated.ok) {
    return validated.result;
  }

  const { contact } = validated;

  try {
    const repo = createSupabaseContactRepository();
    const mailer = createZohoMailer();

    const insertResult = await repo.insertIdempotent(contact);
    if (!insertResult.ok) {
      console.error("[contact] insert failed:", insertResult.error);
      return {
        success: false,
        message: t("Algo salió mal. Intenta de nuevo.", "Something went wrong. Please try again."),
      };
    }

    const claimResult = await repo.claimAttempt(contact.id);
    if (!claimResult.ok) {
      return { success: true, message: t("Mensaje enviado.", "Message sent.") };
    }

    const sendResult = await mailer.send(contact);

    if (sendResult.ok) {
      await repo.markSent(contact.id, sendResult.providerRef || "");
    } else {
      console.error("[contact] send failed:", sendResult.errorCode);
      await repo.markFailed(contact.id, sendResult.errorCode || "unknown");
    }

    return { success: true, message: t("Mensaje enviado.", "Message sent.") };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[contact] UNEXPECTED error:", msg);
    if (err instanceof Error) console.error(err.stack);
    return {
      success: false,
      message: t("Algo salió mal. Intenta de nuevo.", "Something went wrong. Please try again."),
    };
  }
}
