"use client";

import { useRef, useState, useId, useEffect } from "react";
import { useActionState } from "react";
import { submitContact } from "@/lib/contact/actions";
import type { ContactResult } from "@/lib/contact/types";

export type ContactFormLabels = {
  formTitle: string;
  formSub: string;
  nameLabel: string;
  nameErr: string;
  companyLabel: string;
  emailLabel: string;
  emailErr: string;
  topicLabel: string;
  topicOptions: { value: string; label: string }[];
  messageLabel: string;
  messageErr: string;
  submitLabel: string;
  sendingLabel: string;
  formNote: string;
  successTitle: string;
  successSub: string;
  errorGeneral: string;
};

const initialState: ContactResult = { success: false };

async function submitContactWithId(previousState: ContactResult, formData: FormData) {
  formData.set("f-id", crypto.randomUUID());
  return submitContact(previousState, formData);
}

export function ContactForm({ labels, locale }: { labels: ContactFormLabels; locale: string }) {
  const [serverState, dispatch, pending] = useActionState(submitContactWithId, initialState);

  const [resetKey, setResetKey] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const summaryId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const prevSuccess = useRef(false);

  useEffect(() => {
    if (serverState.success && serverState.message) {
      prevSuccess.current = true;
      const id = setTimeout(() => setResetKey((k) => k + 1), 0);
      return () => clearTimeout(id);
    }
    if (!serverState.success) {
      prevSuccess.current = false;
    }
  }, [serverState]);

  const visibleSuccess = serverState.success && !!serverState.message;
  const state = visibleSuccess ? initialState : serverState;
  const visibleError = !state.success && state.message ? state.message : null;

  return (
    <>
      <div
        className="cform__body"
        style={{
          display: visibleSuccess ? "none" : undefined,
          opacity: pending ? 0.6 : 1,
          transition: "opacity .25s ease",
        }}
      >
        <h3 className="cform__title">{labels.formTitle}</h3>
        <p className="cform__sub">{labels.formSub}</p>

        <div
          ref={summaryRef}
          role="alert"
          aria-live="polite"
          id={summaryId}
          tabIndex={-1}
          style={{
            display: visibleError ? undefined : "none",
            color: "#b91c1c",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: "0.9rem",
          }}
        >
          {visibleError}
        </div>

        <form
          className="cform__form"
          noValidate
          action={dispatch}
          key={resetKey}
        >
          <input type="hidden" name="f-locale" value={locale} />
          <input
            type="text"
            name="f-website"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: "absolute", left: "-9999px" }}
            aria-hidden="true"
          />

          <div className="field row2">
            <div
              className={`field${state.errors?.name ? " is-error" : ""}`}
              style={{ marginTop: 0 }}
            >
              <label htmlFor="f-name">
                {labels.nameLabel} <span className="req">*</span>
              </label>
              <input
                id="f-name"
                name="f-name"
                type="text"
                ref={nameRef}
                data-required
                placeholder="Ana García"
                autoComplete="name"
                aria-invalid={state.errors?.name ? "true" : undefined}
                aria-describedby={state.errors?.name ? "f-name-err" : undefined}
              />
              <div className="field__err" id="f-name-err" role="alert">
                {state.errors?.name || labels.nameErr}
              </div>
            </div>
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="f-company">{labels.companyLabel}</label>
              <input id="f-company" name="f-company" type="text" placeholder="Nombre de tu negocio" />
            </div>
          </div>

          <div className={`field${state.errors?.email ? " is-error" : ""}`}>
            <label htmlFor="f-email">
              {labels.emailLabel} <span className="req">*</span>
            </label>
            <input
              id="f-email"
              name="f-email"
              type="email"
              ref={emailRef}
              data-required
              placeholder="ana@correo.com"
              autoComplete="email"
              aria-invalid={state.errors?.email ? "true" : undefined}
              aria-describedby={state.errors?.email ? "f-email-err" : undefined}
            />
            <div className="field__err" id="f-email-err" role="alert">
              {state.errors?.email || labels.emailErr}
            </div>
          </div>

          <div className="field">
            <label htmlFor="f-topic">{labels.topicLabel}</label>
            <select id="f-topic" name="f-topic">
              {labels.topicOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className={`field${state.errors?.message ? " is-error" : ""}`}>
            <label htmlFor="f-msg">
              {labels.messageLabel} <span className="req">*</span>
            </label>
            <textarea
              id="f-msg"
              name="f-msg"
              ref={msgRef}
              data-required
              placeholder="¿Qué te gustaría construir o mejorar?"
              aria-invalid={state.errors?.message ? "true" : undefined}
              aria-describedby={state.errors?.message ? "f-msg-err" : undefined}
            />
            <div className="field__err" id="f-msg-err" role="alert">
              {state.errors?.message || labels.messageErr}
            </div>
          </div>

          <button className="btn btn--primary cform__submit" type="submit" disabled={pending}>
            {pending ? labels.sendingLabel : labels.submitLabel} <span className="arrow">→</span>
          </button>
          <p className="cform__note">{labels.formNote}</p>
        </form>
      </div>

      <div
        className={`cform__success${visibleSuccess ? " show" : ""}`}
        role="status"
        aria-live="polite"
      >
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
