"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PostEditor } from "@/components/admin/post-editor";
import {
  PostFormError,
  PostFormField,
} from "@/components/admin/post-form-field";
import {
  createPost,
  updatePost,
  type ActionResult,
  type PostInput,
} from "@/lib/actions/posts";

export function PostForm({
  postId,
  initial,
}: {
  postId?: string;
  initial?: PostInput;
}) {
  const router = useRouter();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const input = formDataToPostInput(formData);
      const result = postId
        ? await updatePost(postId, input)
        : await createPost(input);
      if (result.success) {
        router.push("/admin/posts");
        router.refresh();
      }
      return result;
    },
    null,
  );

  const errors = state && !state.success ? state.errors : {};
  const fieldError = (field: string) => errors[field]?.[0];
  const hasFieldErrors = Object.keys(errors).some((field) => field !== "_form");

  useEffect(() => {
    if (!state || state.success) return;
    requestAnimationFrame(() => {
      errorSummaryRef.current?.focus();
    });
  }, [state]);

  return (
    <form action={formAction} className="post-form" noValidate>
      {(errors._form?.[0] || hasFieldErrors) && (
        <div
          ref={errorSummaryRef}
          className="form-alert"
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
        >
          {errors._form?.[0] ??
            "Revisa los campos marcados antes de guardar la publicación."}
        </div>
      )}

      <PostEditor initial={initial} errors={errors} />

      <section className="editor-meta">
        <div className="admin-fields">
          <PostFormField
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
              <PostFormError text={fieldError("status")!} />
            )}
          </div>
          <PostFormField
            label="Autor"
            name="author"
            defaultValue={initial?.author ?? "Equipo ZIVELO"}
            error={fieldError("author")}
          />
          <PostFormField
            label="Tiempo de lectura (min)"
            name="read_min"
            type="number"
            min="1"
            max="999"
            defaultValue={String(initial?.read_min ?? 5)}
            error={fieldError("read_min")}
            required
          />
          <PostFormField
            label="Fecha de publicación"
            name="published_at"
            type="date"
            defaultValue={initial?.published_at ?? ""}
            error={fieldError("published_at")}
          />
          <PostFormField
            label="URL de portada"
            name="cover_url"
            type="url"
            defaultValue={initial?.cover_url ?? ""}
            error={fieldError("cover_url")}
          />
          <PostFormField
            label="Subir portada (máx. 5 MB)"
            name="cover_file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            error={fieldError("cover_file")}
          />
          <PostFormField
            label="Texto alternativo de portada (ES)"
            name="cover_alt_es"
            defaultValue={initial?.cover_alt_es ?? ""}
            error={fieldError("cover_alt_es")}
          />
          <PostFormField
            label="Texto alternativo de portada (EN)"
            name="cover_alt_en"
            defaultValue={initial?.cover_alt_en ?? ""}
            error={fieldError("cover_alt_en")}
          />
        </div>
      </section>

      <div className="post-form__actions">
        <Button
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? "Guardando…"
            : postId
              ? "Guardar cambios"
              : "Crear borrador"}
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push("/admin/dashboard")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function formDataToPostInput(data: FormData): PostInput {
  const file = data.get("cover_file");
  return {
    slug: String(data.get("slug") ?? ""),
    status: String(data.get("status") ?? "draft") as PostInput["status"],
    title_es: String(data.get("title_es") ?? ""),
    title_en: String(data.get("title_en") ?? ""),
    summary_es: String(data.get("summary_es") ?? ""),
    summary_en: String(data.get("summary_en") ?? ""),
    content_markdown_es: String(data.get("content_markdown_es") ?? ""),
    content_markdown_en: String(data.get("content_markdown_en") ?? ""),
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
