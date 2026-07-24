import nodemailer from "nodemailer";
import type { ContactMailer } from "../mailer";
import type { NormalizedContact } from "../types";

function buildHtml(contact: NormalizedContact): string {
  const topicLabels: Record<string, string> = {
    web: "Web development",
    restaurant: "Restaurant solution",
    pos: "Point of sale",
    other: "Something else",
  };

  return `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h2 style="color:#1a1a1a;">New contact submission</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;font-weight:600;color:#555;">Name</td><td style="padding:8px 0;">${escapeHtml(contact.name)}</td></tr>
    ${contact.company ? `<tr><td style="padding:8px 0;font-weight:600;color:#555;">Company</td><td style="padding:8px 0;">${escapeHtml(contact.company)}</td></tr>` : ""}
    <tr><td style="padding:8px 0;font-weight:600;color:#555;">Email</td><td style="padding:8px 0;">${escapeHtml(contact.email)}</td></tr>
    <tr><td style="padding:8px 0;font-weight:600;color:#555;">Topic</td><td style="padding:8px 0;">${topicLabels[contact.topic] || contact.topic}</td></tr>
    <tr><td style="padding:8px 0;font-weight:600;color:#555;">Locale</td><td style="padding:8px 0;">${contact.locale}</td></tr>
  </table>
  <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
  <p style="white-space:pre-wrap;">${escapeHtml(contact.message)}</p>
</body>
</html>`.trim();
}

function buildText(contact: NormalizedContact): string {
  const lines = [
    `Name: ${contact.name}`,
    contact.company ? `Company: ${contact.company}` : null,
    `Email: ${contact.email}`,
    `Topic: ${contact.topic}`,
    `Locale: ${contact.locale}`,
    "",
    contact.message,
  ].filter(Boolean);
  return (lines as string[]).join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createZohoMailer(): ContactMailer {
  const transport = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.com",
    port: Number(process.env.ZOHO_SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_SMTP_USER || "benjamin.rodriguez@zivelo.dev",
      pass: process.env.ZOHO_SMTP_APP_PASSWORD || "",
    },
  });

  const smtpUser = process.env.ZOHO_SMTP_USER || "benjamin.rodriguez@zivelo.dev";
  const toEmail = process.env.CONTACT_TO_EMAIL || "contacto@zivelo.dev";

  return {
    async send(contact: NormalizedContact) {
      try {
        const info = await transport.sendMail({
          from: smtpUser,
          to: toEmail,
          replyTo: contact.email,
          subject: `Contact from ${contact.name} — ZIVELO`,
          text: buildText(contact),
          html: buildHtml(contact),
        });
        return { ok: true, providerRef: info.messageId };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown SMTP error";
        return { ok: false, errorCode: msg.slice(0, 200) };
      }
    },
  };
}