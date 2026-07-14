"use client";

import { useRef, useState, type FormEvent } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactFormLabels = {
  formTitle: string;
  formSub: string;
  nameLabel: string;
  nameErr: string;
  companyLabel: string;
  emailLabel: string;
  emailErr: string;
  topicLabel: string;
  topicOptions: [string, string, string, string];
  messageLabel: string;
  messageErr: string;
  submitLabel: string;
  formNote: string;
  successTitle: string;
  successSub: string;
};

type FieldErrors = { name: boolean; email: boolean; message: boolean };

/**
 * Client-side validation + success state, mirroring the original prototype's
 * assets/app.js logic (required-field + email-regex validation, focus first
 * invalid field, swap to a success message on valid submit). No network call —
 * form wiring to a real API/Server Action is a later project phase.
 *
 * Improvement over the original instant display:none/.show swap: the form
 * body crossfades out (opacity + slight blur) before the success panel is
 * shown via the existing `.show` class, which already animates in via the
 * `caseFade` keyframes defined in globals.css. No new CSS classes were added.
 */
export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [errors, setErrors] = useState<FieldErrors>({ name: false, email: false, message: false });
  const [status, setStatus] = useState<"idle" | "fading" | "done">("idle");

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nameVal = (nameRef.current?.value || "").trim();
    const emailVal = (emailRef.current?.value || "").trim();
    const messageVal = (messageRef.current?.value || "").trim();

    const nameBad = !nameVal;
    const emailBad = !emailVal || !EMAIL_RE.test(emailVal);
    const messageBad = !messageVal;

    setErrors({ name: nameBad, email: emailBad, message: messageBad });

    if (nameBad || emailBad || messageBad) {
      if (nameBad) nameRef.current?.focus();
      else if (emailBad) emailRef.current?.focus();
      else if (messageBad) messageRef.current?.focus();
      return;
    }

    setStatus("fading");
    window.setTimeout(() => setStatus("done"), 240);
  }

  const isDone = status === "done";
  const isFading = status !== "idle";

  return (
    <>
      <div
        className="cform__body"
        style={{
          display: isDone ? "none" : undefined,
          opacity: isFading ? 0 : 1,
          filter: isFading ? "blur(2px)" : "none",
          transition: "opacity .25s ease, filter .25s ease",
          pointerEvents: isFading ? "none" : undefined,
        }}
      >
        <h3 className="cform__title">{labels.formTitle}</h3>
        <p className="cform__sub">{labels.formSub}</p>
        <form className="cform__form" noValidate onSubmit={handleSubmit}>
          <div className="field row2">
            <div className={`field${errors.name ? " is-error" : ""}`} style={{ marginTop: 0 }}>
              <label htmlFor="f-name">
                {labels.nameLabel} <span className="req">*</span>
              </label>
              <input
                id="f-name"
                type="text"
                ref={nameRef}
                data-required
                placeholder="Ana García"
                autoComplete="name"
                onChange={() => clearError("name")}
              />
              <div className="field__err">{labels.nameErr}</div>
            </div>
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="f-company">{labels.companyLabel}</label>
              <input id="f-company" type="text" placeholder="Nombre de tu negocio" />
            </div>
          </div>

          <div className={`field${errors.email ? " is-error" : ""}`}>
            <label htmlFor="f-email">
              {labels.emailLabel} <span className="req">*</span>
            </label>
            <input
              id="f-email"
              type="email"
              ref={emailRef}
              data-required
              placeholder="ana@correo.com"
              autoComplete="email"
              onChange={() => clearError("email")}
            />
            <div className="field__err">{labels.emailErr}</div>
          </div>

          <div className="field">
            <label htmlFor="f-topic">{labels.topicLabel}</label>
            <select id="f-topic">
              {labels.topicOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className={`field${errors.message ? " is-error" : ""}`}>
            <label htmlFor="f-msg">
              {labels.messageLabel} <span className="req">*</span>
            </label>
            <textarea
              id="f-msg"
              ref={messageRef}
              data-required
              placeholder="¿Qué te gustaría construir o mejorar?"
              onChange={() => clearError("message")}
            />
            <div className="field__err">{labels.messageErr}</div>
          </div>

          <button className="btn btn--primary cform__submit" type="submit">
            {labels.submitLabel} <span className="arrow">→</span>
          </button>
          <p className="cform__note">{labels.formNote}</p>
        </form>
      </div>

      <div className={`cform__success${isDone ? " show" : ""}`}>
        <div className="tick">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="cform__title">{labels.successTitle}</h3>
        <p className="cform__sub" style={{ marginTop: 10 }}>
          {labels.successSub}
        </p>
      </div>
    </>
  );
}
