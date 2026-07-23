"use client";

import { useActionState, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { marked } from "marked";
import { useRouter } from "@/i18n/navigation";
import { createPost, updatePost, type ActionResult, type PostInput } from "@/lib/actions/posts";

type LocaleTab = "es" | "en";

export function PostForm({ postId, initial }: { postId?: string; initial?: PostInput }) {
  const router = useRouter();
  const [tab, setTab] = useState<LocaleTab>("es");
  const [contentEs, setContentEs] = useState(initial?.content_html_es ?? "");
  const [contentEn, setContentEn] = useState(initial?.content_html_en ?? "");

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const input = formDataToPostInput(formData, contentEs, contentEn);
      const result = postId ? await updatePost(postId, input) : await createPost(input);
      if (result.success) {
        router.push("/admin/dashboard");
        router.refresh();
      }
      return result;
    },
    null,
  );

  const errors = state && !state.success ? state.errors : {};
  const fieldError = (field: string) => errors[field]?.[0];

  return (
    <form action={formAction} className="post-form" noValidate>
      {errors._form?.[0] && <div className="form-alert" role="alert" aria-live="assertive">{errors._form[0]}</div>}
      <div className="editor-tabs" role="tablist" aria-label="Idioma del artículo">
        <button type="button" role="tab" aria-selected={tab === "es"} className={tab === "es" ? "is-active" : ""} onClick={() => setTab("es")}>ES · Español</button>
        <button type="button" role="tab" aria-selected={tab === "en"} className={tab === "en" ? "is-active" : ""} onClick={() => setTab("en")}>EN · English</button>
      </div>

      <section className="editor-pane" hidden={tab !== "es"} role="tabpanel">
        <Field label="Título" name="title_es" defaultValue={initial?.title_es} error={fieldError("title_es")} required />
        <Field label="Resumen" name="summary_es" tag="textarea" defaultValue={initial?.summary_es} error={fieldError("summary_es")} required />
        <RichEditor label="Contenido" value={contentEs} onChange={setContentEs} locale="es" error={fieldError("content_html_es")} />
        <Field label="Categoría" name="tag_es" defaultValue={initial?.tag_es} error={fieldError("tag_es")} required />
      </section>
      <section className="editor-pane" hidden={tab !== "en"} role="tabpanel">
        <Field label="Title" name="title_en" defaultValue={initial?.title_en} error={fieldError("title_en")} required />
        <Field label="Summary" name="summary_en" tag="textarea" defaultValue={initial?.summary_en} error={fieldError("summary_en")} required />
        <RichEditor label="Content" value={contentEn} onChange={setContentEn} locale="en" error={fieldError("content_html_en")} />
        <Field label="Category" name="tag_en" defaultValue={initial?.tag_en} error={fieldError("tag_en")} required />
      </section>

      <section className="editor-meta">
        <div className="admin-fields">
          <Field label="Slug" name="slug" defaultValue={initial?.slug} error={fieldError("slug")} required />
          <div className="field"><label htmlFor="status">Estado</label><select id="status" name="status" defaultValue={initial?.status ?? "draft"}><option value="draft">Borrador</option><option value="published">Publicado</option></select>{fieldError("status") && <ErrorText text={fieldError("status")!} />}</div>
          <Field label="Autor" name="author" defaultValue={initial?.author ?? "Equipo ZIVELO"} error={fieldError("author")} />
          <Field label="Tiempo de lectura (min)" name="read_min" type="number" min="1" max="999" defaultValue={String(initial?.read_min ?? 5)} error={fieldError("read_min")} required />
          <Field label="Fecha de publicación" name="published_at" type="date" defaultValue={initial?.published_at ?? ""} error={fieldError("published_at")} />
          <Field label="URL de portada" name="cover_url" type="url" defaultValue={initial?.cover_url ?? ""} error={fieldError("cover_url")} />
          <Field label="Subir portada (máx. 5 MB)" name="cover_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" error={fieldError("cover_file")} />
          <Field label="Texto alternativo de portada (ES)" name="cover_alt_es" defaultValue={initial?.cover_alt_es ?? ""} error={fieldError("cover_alt_es")} />
          <Field label="Texto alternativo de portada (EN)" name="cover_alt_en" defaultValue={initial?.cover_alt_en ?? ""} error={fieldError("cover_alt_en")} />
        </div>
        <MarkdownImport onImport={(html) => tab === "es" ? setContentEs(html) : setContentEn(html)} />
      </section>

      <div className="post-form__actions">
        <button className="btn btn--primary" type="submit" disabled={isPending}>{isPending ? "Guardando…" : postId ? "Guardar cambios" : "Crear borrador"}</button>
        <button className="btn btn--ghost" type="button" onClick={() => router.push("/admin/dashboard")}>Cancelar</button>
      </div>
    </form>
  );
}

function RichEditor({ label, value, onChange, locale, error }: { label: string; value: string; onChange: (html: string) => void; locale: LocaleTab; error?: string }) {
  const editor = useEditor({ extensions: [StarterKit, Link.configure({ openOnClick: false, protocols: ["http", "https"] })], content: value, immediatelyRender: false, onUpdate: ({ editor: current }) => onChange(current.getHTML()) });
  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false }); }, [editor, value]);
  if (!editor) return <div className="field"><label>{label}</label><div className="editor-surface" aria-busy="true" /></div>;
  return <div className="field"><label>{label} <span className="muted">({locale.toUpperCase()})</span></label><div className="vtoolbar" role="toolbar" aria-label={label}><button type="button" onClick={() => editor.chain().focus().toggleBold().run()} aria-pressed={editor.isActive("bold")}>Negrita</button><button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} aria-pressed={editor.isActive("italic")}>Cursiva</button><button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-pressed={editor.isActive("heading", { level: 2 })}>Título</button><button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} aria-pressed={editor.isActive("bulletList")}>Lista</button><button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-pressed={editor.isActive("blockquote")}>Cita</button></div><EditorContent editor={editor} className="editor-surface" aria-label={label} />{error && <ErrorText text={error} />}</div>;
}

function MarkdownImport({ onImport }: { onImport: (html: string) => void }) {
  const [message, setMessage] = useState("");
  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!/\.(md|markdown)$/i.test(file.name) || file.size > 1_000_000) { setMessage("Usa un archivo .md de máximo 1 MB."); return; }
    onImport(await marked.parse(await file.text()));
    setMessage(`✓ ${file.name} cargado. Revisa el contenido antes de guardar.`);
  }
  return <div className="markdown-import"><label className="btn btn--ghost btn--sm">Importar Markdown<input type="file" accept=".md,.markdown,text/markdown" hidden onChange={(event) => { void handleFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>{message && <span className="admin-meta" role="status">{message}</span>}</div>;
}

function formDataToPostInput(data: FormData, contentEs: string, contentEn: string): PostInput {
  const file = data.get("cover_file");
  return { slug: String(data.get("slug") ?? ""), status: (String(data.get("status") ?? "draft") as PostInput["status"]), title_es: String(data.get("title_es") ?? ""), title_en: String(data.get("title_en") ?? ""), summary_es: String(data.get("summary_es") ?? ""), summary_en: String(data.get("summary_en") ?? ""), content_html_es: contentEs, content_html_en: contentEn, tag_es: String(data.get("tag_es") ?? ""), tag_en: String(data.get("tag_en") ?? ""), cover_url: String(data.get("cover_url") ?? "") || null, cover_file: file instanceof File && file.size ? file : null, cover_alt_es: String(data.get("cover_alt_es") ?? "") || null, cover_alt_en: String(data.get("cover_alt_en") ?? "") || null, author: String(data.get("author") ?? ""), read_min: Number(data.get("read_min")) || 5, published_at: String(data.get("published_at") ?? "") || null };
}

function Field({ label, name, defaultValue, error, tag, type = "text", min, max, accept, required }: { label: string; name: string; defaultValue?: string; error?: string; tag?: "textarea"; type?: string; min?: string; max?: string; accept?: string; required?: boolean }) {
  const id = `post-${name}`;
  return <div className="field"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>{tag === "textarea" ? <textarea id={id} name={name} defaultValue={defaultValue ?? ""} rows={4} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} /> : <input id={id} name={name} type={type} accept={accept} min={min} max={max} defaultValue={type === "file" ? undefined : defaultValue ?? ""} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />}{error && <ErrorText id={`${id}-error`} text={error} />}</div>;
}

function ErrorText({ id, text }: { id?: string; text: string }) { return <p className="field-error" id={id} role="alert">{text}</p>; }
