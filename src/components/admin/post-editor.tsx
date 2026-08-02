"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MutableRefObject } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostFormField } from "@/components/admin/post-form-field";
import { SanitizedHtmlPreview } from "@/components/admin/sanitized-html-preview";
import { previewMarkdown, type PostInput } from "@/lib/actions/posts";

type LocaleTab = "es" | "en";
type ModeTab = "edit" | "preview";
type FieldErrors = Record<string, string[] | undefined>;

export function PostEditor({
  initial,
  errors,
}: {
  initial?: PostInput;
  errors: FieldErrors;
}) {
  const [localeTab, setLocaleTab] = useState<LocaleTab>("es");
  const [modeTab, setModeTab] = useState<ModeTab>("edit");
  const [content, setContent] = useState({
    es: initial?.content_markdown_es ?? "",
    en: initial?.content_markdown_en ?? "",
  });
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const localeTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const modeTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const fieldError = (field: string) => errors[field]?.[0];

  const handleModeTab = useCallback(
    async (tab: ModeTab) => {
      if (tab === "edit") {
        setModeTab("edit");
        return;
      }
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const result = await previewMarkdown(content[localeTab]);
        if (result.success) {
          setPreviewHtml(result.html);
          setModeTab("preview");
        } else {
          setPreviewError(result.error);
        }
      } catch {
        setPreviewError("Error al generar la vista previa");
      } finally {
        setPreviewLoading(false);
      }
    },
    [content, localeTab],
  );

  const handleLocaleTab = useCallback((tab: LocaleTab) => {
    setLocaleTab(tab);
    setModeTab("edit");
    setPreviewHtml(null);
    setPreviewError(null);
  }, []);

  const moveTab = useCallback(
    (
      event: KeyboardEvent<HTMLButtonElement>,
      index: number,
      tabs: readonly string[],
      select: (tab: string) => void,
      refs: MutableRefObject<Array<HTMLButtonElement | null>>,
    ) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + direction + tabs.length) % tabs.length;
      select(tabs[nextIndex]);
      requestAnimationFrame(() => refs.current[nextIndex]?.focus());
    },
    [],
  );

  async function handleImportFile(file: File | undefined) {
    if (!file) return;
    if (!/\.(md|markdown)$/i.test(file.name) || file.size > 1_000_000) {
      setImportMessage("Usa un archivo .md de máximo 1 MB.");
      return;
    }
    const text = await file.text();
    setContent((current) => ({ ...current, [localeTab]: text }));
    setImportMessage(`✓ ${file.name} cargado. Revisa el contenido antes de guardar.`);
  }

  useEffect(() => {
    const englishFields = new Set([
      "title_en",
      "summary_en",
      "content_markdown_en",
      "tag_en",
      "cover_alt_en",
    ]);
    const firstField = Object.keys(errors).find((field) => field !== "_form");
    if (firstField && englishFields.has(firstField)) {
      const frame = requestAnimationFrame(() => {
        setLocaleTab("en");
        setModeTab("edit");
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [errors]);

  return (
    <>
      <Tabs value={localeTab} onValueChange={(value) => handleLocaleTab(value as LocaleTab)}>
        <TabsList className="editor-tabs" variant="line" aria-label="Idioma del artículo">
          {(["es", "en"] as const).map((locale, index) => (
            <TabsTrigger
              key={locale}
              id={`post-tab-${locale}`}
              aria-controls={`post-panel-${locale}`}
              ref={(element) => { localeTabRefs.current[index] = element; }}
              value={locale}
              className={localeTab === locale ? "is-active" : ""}
              onKeyDown={(event) =>
                moveTab(event, index, ["es", "en"], (tab) =>
                  handleLocaleTab(tab as LocaleTab), localeTabRefs)
              }
            >
              {locale === "es" ? "ES · Español" : "EN · English"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="editor-mode-tabs" role="tablist" aria-label="Modo del editor">
        {(["edit", "preview"] as const).map((mode, index) => (
          <button
            key={mode}
            id={`post-mode-tab-${mode}`}
            type="button"
            role="tab"
            aria-selected={modeTab === mode}
            aria-controls={`post-mode-panel-${mode}`}
            aria-disabled={mode === "preview" && previewLoading}
            tabIndex={modeTab === mode ? 0 : -1}
            ref={(element) => { modeTabRefs.current[index] = element; }}
            className={modeTab === mode ? "is-active" : ""}
            onClick={() => {
              if (mode !== "preview" || !previewLoading) void handleModeTab(mode);
            }}
            onKeyDown={(event) =>
              moveTab(event, index, ["edit", "preview"], (tab) =>
                void handleModeTab(tab as ModeTab), modeTabRefs)
            }
          >
            {mode === "edit" ? "Editar" : previewLoading ? "Cargando…" : "Vista previa"}
          </button>
        ))}
      </div>

      <div
        id="post-mode-panel-edit"
        role="tabpanel"
        aria-labelledby="post-mode-tab-edit"
        hidden={modeTab !== "edit"}
      >
        <LanguagePane
          locale="es"
          activeLocale={localeTab}
          initial={initial}
          content={content.es}
          setContent={(value) => setContent((current) => ({ ...current, es: value }))}
          fieldError={fieldError}
          importMessage={importMessage}
          onImport={handleImportFile}
        />
        <LanguagePane
          locale="en"
          activeLocale={localeTab}
          initial={initial}
          content={content.en}
          setContent={(value) => setContent((current) => ({ ...current, en: value }))}
          fieldError={fieldError}
          importMessage={importMessage}
          onImport={handleImportFile}
        />
      </div>

      <section
        id="post-mode-panel-preview"
        className="editor-pane"
        hidden={modeTab !== "preview"}
        role="tabpanel"
        aria-labelledby="post-mode-tab-preview"
      >
        {previewError && <div className="form-alert" role="alert">{previewError}</div>}
        {previewHtml && <SanitizedHtmlPreview html={previewHtml} />}
      </section>
    </>
  );
}

function LanguagePane({
  locale,
  activeLocale,
  initial,
  content,
  setContent,
  fieldError,
  importMessage,
  onImport,
}: {
  locale: LocaleTab;
  activeLocale: LocaleTab;
  initial?: PostInput;
  content: string;
  setContent: (value: string) => void;
  fieldError: (field: string) => string | undefined;
  importMessage: string;
  onImport: (file: File | undefined) => void;
}) {
  const spanish = locale === "es";
  return (
    <section
      id={`post-panel-${locale}`}
      className="editor-pane"
      hidden={activeLocale !== locale}
      role="tabpanel"
      aria-labelledby={`post-tab-${locale}`}
    >
      <PostFormField
        label={spanish ? "Título" : "Title"}
        name={`title_${locale}`}
        defaultValue={initial?.[`title_${locale}`]}
        error={fieldError(`title_${locale}`)}
        required
      />
      <PostFormField
        label={spanish ? "Resumen" : "Summary"}
        name={`summary_${locale}`}
        tag="textarea"
        defaultValue={initial?.[`summary_${locale}`]}
        error={fieldError(`summary_${locale}`)}
        required
      />
      <MarkdownField
        label={spanish ? "Contenido" : "Content"}
        name={`content_markdown_${locale}`}
        value={content}
        onChange={setContent}
        error={fieldError(`content_markdown_${locale}`)}
        locale={locale.toUpperCase()}
      />
      <MarkdownImport
        id={`post-import-${locale}`}
        onImport={onImport}
        message={importMessage}
      />
      <PostFormField
        label={spanish ? "Categoría" : "Category"}
        name={`tag_${locale}`}
        defaultValue={initial?.[`tag_${locale}`]}
        error={fieldError(`tag_${locale}`)}
        required
      />
    </section>
  );
}

function MarkdownImport({
  id,
  onImport,
  message,
}: {
  id: string;
  onImport: (file: File | undefined) => void;
  message: string;
}) {
  return (
    <div className="markdown-import">
      <label className={buttonVariants({ variant: "outline", size: "sm" })} htmlFor={id}>
        Importar Markdown
      </label>
      <input
        id={id}
        type="file"
        accept=".md,.markdown,text/markdown"
        hidden
        onChange={(event) => {
          void onImport(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      {message && <span className="admin-meta" role="status" aria-live="polite">{message}</span>}
    </div>
  );
}

function MarkdownField({
  label,
  name,
  value,
  onChange,
  error,
  locale,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  locale: string;
}) {
  const id = `post-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label} <span className="muted">({locale})</span></label>
      <p className="field-hint">
        Soporta sintaxis Markdown: **negrita**, *cursiva*, ## títulos, listas,
        enlaces, bloques de código, tablas.
      </p>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={18}
        className="textarea--mono"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p className="field-error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
