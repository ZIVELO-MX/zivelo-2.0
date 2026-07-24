"use client";

import { useActionState, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  createPost,
  updatePost,
  previewMarkdown,
  type ActionResult,
  type PostInput,
} from "@/lib/actions/posts";

type LocaleTab = "es" | "en";
type ModeTab = "edit" | "preview";

export function PostForm({
  postId,
  initial,
}: {
  postId?: string;
  initial?: PostInput;
}) {
  const router = useRouter();
  const [localeTab, setLocaleTab] = useState<LocaleTab>("es");
  const [modeTab, setModeTab] = useState<ModeTab>("edit");
  const [contentMarkdownEs, setContentMarkdownEs] = useState(
    initial?.content_markdown_es ?? "",
  );
  const [contentMarkdownEn, setContentMarkdownEn] = useState(
    initial?.content_markdown_en ?? "",
  );
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState("");

  const activeContent =
    localeTab === "es" ? contentMarkdownEs : contentMarkdownEn;
  const setActiveContent =
    localeTab === "es" ? setContentMarkdownEs : setContentMarkdownEn;

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const input = formDataToPostInput(
        formData,
        contentMarkdownEs,
        contentMarkdownEn,
      );
      const result = postId
        ? await updatePost(postId, input)
        : await createPost(input);
      if (result.success) {
        router.push("/admin/dashboard");
        router.refresh();
      }
      return result;
    },
    null,
  );

  const handleModeTab = useCallback(
    async (tab: ModeTab) => {
      if (tab === "edit") {
        setModeTab("edit");
        return;
      }
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const result = await previewMarkdown(activeContent);
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
    [activeContent],
  );

  const handleLocaleTab = useCallback((tab: LocaleTab) => {
    setLocaleTab(tab);
    setModeTab("edit");
    setPreviewHtml(null);
    setPreviewError(null);
  }, []);

  async function handleImportFile(file: File | undefined) {
    if (!file) return;
    if (!/\.(md|markdown)$/i.test(file.name) || file.size > 1_000_000) {
      setImportMessage("Usa un archivo .md de máximo 1 MB.");
      return;
    }
    const text = await file.text();
    setActiveContent(text);
    setImportMessage(`✓ ${file.name} cargado. Revisa el contenido antes de guardar.`);
  }

  const errors = state && !state.success ? state.errors : {};
  const fieldError = (field: string) => errors[field]?.[0];

  return (
    <form action={formAction} className="post-form" noValidate>
      {errors._form?.[0] && (
        <div className="form-alert" role="alert" aria-live="assertive">
          {errors._form[0]}
        </div>
      )}

      <div className="editor-tabs" role="tablist" aria-label="Idioma del artículo">
        <button
          type="button"
          role="tab"
          aria-selected={localeTab === "es"}
          className={localeTab === "es" ? "is-active" : ""}
          onClick={() => handleLocaleTab("es")}
        >
          ES · Español
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={localeTab === "en"}
          className={localeTab === "en" ? "is-active" : ""}
          onClick={() => handleLocaleTab("en")}
        >
          EN · English
        </button>
      </div>

      <div className="editor-mode-tabs" role="tablist" aria-label="Modo del editor">
        <button
          type="button"
          role="tab"
          aria-selected={modeTab === "edit"}
          className={modeTab === "edit" ? "is-active" : ""}
          onClick={() => handleModeTab("edit")}
        >
          Editar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={modeTab === "preview"}
          className={modeTab === "preview" ? "is-active" : ""}
          onClick={() => handleModeTab("preview")}
          disabled={previewLoading}
        >
          {previewLoading ? "Cargando…" : "Vista previa"}
        </button>
      </div>

      <section
        className="editor-pane"
        hidden={modeTab !== "edit"}
        role="tabpanel"
      >
        <Field
          label="Título"
          name="title_es"
          defaultValue={initial?.title_es}
          error={fieldError("title_es")}
          required
        />
        <Field
          label="Resumen"
          name="summary_es"
          tag="textarea"
          defaultValue={initial?.summary_es}
          error={fieldError("summary_es")}
          required
        />
        {localeTab === "es" && (
          <MarkdownField
            label="Contenido"
            name="content_markdown_es"
            value={contentMarkdownEs}
            onChange={setContentMarkdownEs}
            error={fieldError("content_markdown_es")}
            locale="ES"
          />
        )}
        {localeTab === "en" && (
          <MarkdownField
            label="Content"
            name="content_markdown_en"
            value={contentMarkdownEn}
            onChange={setContentMarkdownEn}
            error={fieldError("content_markdown_en")}
            locale="EN"
          />
        )}
        <Field
          label="Categoría"
          name="tag_es"
          defaultValue={initial?.tag_es}
          error={fieldError("tag_es")}
          required
        />
      </section>

      <section
        className="editor-pane"
        hidden={modeTab !== "preview"}
        role="tabpanel"
      >
        {previewError && (
          <div className="form-alert" role="alert">
            {previewError}
          </div>
        )}
        {previewHtml && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </section>

      <section className="editor-meta">
        <div className="admin-fields">
          <Field
            label="Slug"
            name="slug"
            defaultValue={initial?.slug}
            error={fieldError("slug")}
            required
          />
          <div className="field">
            <label htmlFor="status">Estado</label>
            <select
              id="status"
              name="status"
              defaultValue={initial?.status ?? "draft"}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
            {fieldError("status") && (
              <ErrorText text={fieldError("status")!} />
            )}
          </div>
          <Field
            label="Autor"
            name="author"
            defaultValue={initial?.author ?? "Equipo ZIVELO"}
            error={fieldError("author")}
          />
          <Field
            label="Tiempo de lectura (min)"
            name="read_min"
            type="number"
            min="1"
            max="999"
            defaultValue={String(initial?.read_min ?? 5)}
            error={fieldError("read_min")}
            required
          />
          <Field
            label="Fecha de publicación"
            name="published_at"
            type="date"
            defaultValue={initial?.published_at ?? ""}
            error={fieldError("published_at")}
          />
          <Field
            label="URL de portada"
            name="cover_url"
            type="url"
            defaultValue={initial?.cover_url ?? ""}
            error={fieldError("cover_url")}
          />
          <Field
            label="Subir portada (máx. 5 MB)"
            name="cover_file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            error={fieldError("cover_file")}
          />
          <Field
            label="Texto alternativo de portada (ES)"
            name="cover_alt_es"
            defaultValue={initial?.cover_alt_es ?? ""}
            error={fieldError("cover_alt_es")}
          />
          <Field
            label="Texto alternativo de portada (EN)"
            name="cover_alt_en"
            defaultValue={initial?.cover_alt_en ?? ""}
            error={fieldError("cover_alt_en")}
          />
        </div>
        <div className="markdown-import">
          <label className="btn btn--ghost btn--sm">
            Importar Markdown
            <input
              type="file"
              accept=".md,.markdown,text/markdown"
              hidden
              onChange={(event) => {
                void handleImportFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
          {importMessage && (
            <span className="admin-meta" role="status">
              {importMessage}
            </span>
          )}
        </div>
      </section>

      <div className="post-form__actions">
        <button
          className="btn btn--primary"
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? "Guardando…"
            : postId
              ? "Guardar cambios"
              : "Crear borrador"}
        </button>
        <button
          className="btn btn--ghost"
          type="button"
          onClick={() => router.push("/admin/dashboard")}
        >
          Cancelar
        </button>
      </div>
    </form>
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
  onChange: (v: string) => void;
  error?: string;
  locale: string;
}) {
  const id = `post-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} <span className="muted">({locale})</span>
      </label>
      <p className="field-hint">
        Soporta sintaxis Markdown: **negrita**, *cursiva*, ## títulos, listas,
        enlaces, bloques de código, tablas.
      </p>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={18}
        className="textarea--mono"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <ErrorText id={`${id}-error`} text={error} />}
    </div>
  );
}

function formDataToPostInput(
  data: FormData,
  contentMarkdownEs: string,
  contentMarkdownEn: string,
): PostInput {
  const file = data.get("cover_file");
  return {
    slug: String(data.get("slug") ?? ""),
    status: String(data.get("status") ?? "draft") as PostInput["status"],
    title_es: String(data.get("title_es") ?? ""),
    title_en: String(data.get("title_en") ?? ""),
    summary_es: String(data.get("summary_es") ?? ""),
    summary_en: String(data.get("summary_en") ?? ""),
    content_markdown_es: contentMarkdownEs,
    content_markdown_en: contentMarkdownEn,
    tag_es: String(data.get("tag_es") ?? ""),
    tag_en: String(data.get("tag_en") ?? ""),
    cover_url: String(data.get("cover_url") ?? "") || null,
    cover_file:
      file instanceof File && file.size ? file : null,
    cover_alt_es: String(data.get("cover_alt_es") ?? "") || null,
    cover_alt_en: String(data.get("cover_alt_en") ?? "") || null,
    author: String(data.get("author") ?? ""),
    read_min: Number(data.get("read_min")) || 5,
    published_at: String(data.get("published_at") ?? "") || null,
  };
}

function Field({
  label,
  name,
  defaultValue,
  error,
  tag,
  type = "text",
  min,
  max,
  accept,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  tag?: "textarea";
  type?: string;
  min?: string;
  max?: string;
  accept?: string;
  required?: boolean;
}) {
  const id = `post-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {tag === "textarea" ? (
        <textarea
          id={id}
          name={name}
          defaultValue={defaultValue ?? ""}
          rows={4}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          accept={accept}
          min={min}
          max={max}
          defaultValue={type === "file" ? undefined : defaultValue ?? ""}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error && <ErrorText id={`${id}-error`} text={error} />}
    </div>
  );
}

function ErrorText({
  id,
  text,
}: {
  id?: string;
  text: string;
}) {
  return (
    <p className="field-error" id={id} role="alert">
      {text}
    </p>
  );
}
