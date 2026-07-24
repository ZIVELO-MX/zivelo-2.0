"use server";

import { auth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { markdownToSafeHtml } from "@/lib/md";

type FieldErrors = Record<string, string[]>;

export type ActionResult =
  | { success: true; slug?: string }
  | { success: false; errors: FieldErrors };

export type PostInput = {
  slug: string;
  status: "draft" | "published";
  title_es: string;
  title_en: string;
  summary_es: string;
  summary_en: string;
  content_markdown_es: string;
  content_markdown_en: string;
  tag_es: string;
  tag_en: string;
  cover_url: string | null;
  cover_alt_es: string | null;
  cover_alt_en: string | null;
  author: string;
  read_min: number;
  published_at: string | null;
  cover_file?: File | null;
};

export type MarkdownPreviewResult =
  | { success: true; html: string }
  | { success: false; error: string };

const MAX_PREVIEW_CHARS = 200_000;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

async function getAuthError(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return "No autorizado";

  const supabase = createServiceClient();
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("email", email.toLowerCase().trim());

  if (!count || count === 0) return "No autorizado";
  return null;
}

function addError(errors: FieldErrors, field: string, message: string) {
  if (!errors[field]) errors[field] = [];
  errors[field].push(message);
}

function isPresent(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validatePostInput(input: PostInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!isPresent(input.slug)) {
    addError(errors, "slug", "El slug es requerido");
  } else if (!SLUG_PATTERN.test(input.slug)) {
    addError(errors, "slug", "Solo minúsculas, números y guiones");
  } else if (input.slug.length > 200) {
    addError(errors, "slug", "Máximo 200 caracteres");
  }

  if (!["draft", "published"].includes(input.status)) {
    addError(errors, "status", "Estado inválido");
  }

  if (!isPresent(input.title_es))
    addError(errors, "title_es", "Requerido");
  else if (input.title_es.length > 500)
    addError(errors, "title_es", "Máximo 500 caracteres");

  if (!isPresent(input.title_en))
    addError(errors, "title_en", "Required");
  else if (input.title_en.length > 500)
    addError(errors, "title_en", "Max 500 characters");

  if (!isPresent(input.summary_es))
    addError(errors, "summary_es", "Requerido");
  else if (input.summary_es.length > 500)
    addError(errors, "summary_es", "Máximo 500 caracteres");

  if (!isPresent(input.summary_en))
    addError(errors, "summary_en", "Required");
  else if (input.summary_en.length > 500)
    addError(errors, "summary_en", "Max 500 characters");

  if (!isPresent(input.tag_es))
    addError(errors, "tag_es", "Requerido");
  else if (input.tag_es.length > 100)
    addError(errors, "tag_es", "Máximo 100 caracteres");

  if (!isPresent(input.tag_en))
    addError(errors, "tag_en", "Required");
  else if (input.tag_en.length > 100)
    addError(errors, "tag_en", "Max 100 characters");

  if (typeof input.content_markdown_es !== "string")
    addError(errors, "content_markdown_es", "Requerido");
  if (typeof input.content_markdown_en !== "string")
    addError(errors, "content_markdown_en", "Required");

  if (
    typeof input.read_min !== "number" ||
    input.read_min < 1 ||
    input.read_min > 999
  ) {
    addError(errors, "read_min", "Debe ser 1–999");
  }

  if (input.author && input.author.length > 200) {
    addError(errors, "author", "Máximo 200 caracteres");
  }

  if (input.cover_url) {
    try {
      new URL(input.cover_url);
    } catch {
      addError(errors, "cover_url", "URL inválida");
    }
    if (input.cover_url.length > 1000)
      addError(errors, "cover_url", "Máximo 1000 caracteres");
  }

  if (
    input.cover_file &&
    (!(input.cover_file instanceof File) ||
      input.cover_file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(
        input.cover_file.type,
      ))
  ) {
    addError(
      errors,
      "cover_file",
      "La portada debe ser una imagen permitida de máximo 5 MB",
    );
  }

  if (input.cover_alt_es && input.cover_alt_es.length > 500) {
    addError(errors, "cover_alt_es", "Máximo 500 caracteres");
  }
  if (input.cover_alt_en && input.cover_alt_en.length > 500) {
    addError(errors, "cover_alt_en", "Max 500 characters");
  }

  if (input.published_at) {
    const d = new Date(input.published_at);
    if (isNaN(d.getTime()))
      addError(errors, "published_at", "Fecha inválida");
  }

  return errors;
}

async function buildPayload(
  input: PostInput,
  coverUrl = input.cover_url,
) {
  const publishedAt =
    input.status === "published" && !input.published_at
      ? new Date().toISOString().split("T")[0]
      : input.published_at;

  const [htmlEs, htmlEn] = await Promise.all([
    markdownToSafeHtml(input.content_markdown_es),
    markdownToSafeHtml(input.content_markdown_en),
  ]);

  return {
    slug: input.slug,
    status: input.status,
    title_es: input.title_es.trim(),
    title_en: input.title_en.trim(),
    summary_es: input.summary_es.trim(),
    summary_en: input.summary_en.trim(),
    content_markdown_es: input.content_markdown_es,
    content_markdown_en: input.content_markdown_en,
    content_html_es: htmlEs,
    content_html_en: htmlEn,
    tag_es: input.tag_es.trim(),
    tag_en: input.tag_en.trim(),
    cover_url: coverUrl || null,
    cover_alt_es: input.cover_alt_es?.trim() || null,
    cover_alt_en: input.cover_alt_en?.trim() || null,
    author: input.author?.trim() || "Equipo ZIVELO",
    read_min: input.read_min,
    published_at: publishedAt,
  };
}

async function uploadCover(
  supabase: ReturnType<typeof createServiceClient>,
  file: File | null | undefined,
) {
  if (!file) return null;
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `posts/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("covers")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: "No se pudo subir la portada" } as const;
  return {
    path,
    url: supabase.storage.from("covers").getPublicUrl(path).data.publicUrl,
  } as const;
}

async function removeCover(
  supabase: ReturnType<typeof createServiceClient>,
  url: string | null | undefined,
) {
  const path = url ? extractStoragePath(url) : null;
  if (path) await supabase.storage.from("covers").remove([path]);
}

export async function createPost(input: PostInput): Promise<ActionResult> {
  const authError = await getAuthError();
  if (authError)
    return { success: false, errors: { _form: [authError] } };

  const errors = validatePostInput(input);
  if (Object.keys(errors).length > 0) return { success: false, errors };

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("posts")
    .select("slug")
    .eq("slug", input.slug)
    .maybeSingle();

  if (existing) {
    return { success: false, errors: { slug: ["Este slug ya está en uso"] } };
  }

  const uploaded = await uploadCover(supabase, input.cover_file);
  if (uploaded?.error)
    return { success: false, errors: { cover_file: [uploaded.error] } };
  const coverUrl = uploaded?.url ?? input.cover_url;

  let payload: ReturnType<typeof buildPayload> extends Promise<infer T>
    ? T
    : never;
  try {
    payload = await buildPayload(input, coverUrl);
  } catch {
    if (uploaded?.path)
      await supabase.storage.from("covers").remove([uploaded.path]);
    return {
      success: false,
      errors: { _form: ["No se pudo procesar el contenido"] },
    };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert(payload)
    .select("slug")
    .single();

  if (error) {
    if (uploaded?.path)
      await supabase.storage.from("covers").remove([uploaded.path]);
    return {
      success: false,
      errors: { _form: ["No se pudo guardar la publicación"] },
    };
  }

  revalidatePath("/", "layout");
  return { success: true, slug: data.slug };
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<ActionResult> {
  const authError = await getAuthError();
  if (authError)
    return { success: false, errors: { _form: [authError] } };

  const errors = validatePostInput(input);
  if (Object.keys(errors).length > 0) return { success: false, errors };

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("posts")
    .select("slug, cover_url")
    .eq("id", id)
    .single();

  if (!existing) {
    return { success: false, errors: { _form: ["Post no encontrado"] } };
  }

  if (existing.slug !== input.slug) {
    const { data: slugConflict } = await supabase
      .from("posts")
      .select("slug")
      .eq("slug", input.slug)
      .neq("id", id)
      .maybeSingle();

    if (slugConflict) {
      return {
        success: false,
        errors: { slug: ["Este slug ya está en uso"] },
      };
    }
  }

  const uploaded = await uploadCover(supabase, input.cover_file);
  if (uploaded?.error)
    return { success: false, errors: { cover_file: [uploaded.error] } };
  const coverUrl = uploaded?.url ?? input.cover_url;

  let payload: ReturnType<typeof buildPayload> extends Promise<infer T>
    ? T
    : never;
  try {
    payload = await buildPayload(input, coverUrl);
  } catch {
    if (uploaded?.path)
      await supabase.storage.from("covers").remove([uploaded.path]);
    return {
      success: false,
      errors: { _form: ["No se pudo procesar el contenido"] },
    };
  }

  const { data, error } = await supabase
    .from("posts")
    .update(payload)
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    if (uploaded?.path)
      await supabase.storage.from("covers").remove([uploaded.path]);
    return {
      success: false,
      errors: { _form: ["No se pudo actualizar la publicación"] },
    };
  }

  if (existing.cover_url && existing.cover_url !== coverUrl)
    await removeCover(supabase, existing.cover_url);

  revalidatePath("/", "layout");
  return { success: true, slug: data.slug };
}

export async function previewMarkdown(
  markdown: string,
): Promise<MarkdownPreviewResult> {
  const authError = await getAuthError();
  if (authError) return { success: false, error: authError };

  if (typeof markdown !== "string" || markdown.length > MAX_PREVIEW_CHARS) {
    return { success: false, error: "Contenido demasiado extenso" };
  }

  try {
    const html = await markdownToSafeHtml(markdown);
    return { success: true, html };
  } catch {
    return { success: false, error: "Error al generar la vista previa" };
  }
}

function extractStoragePath(coverUrl: string): string | null {
  try {
    const url = new URL(coverUrl);
    const match = url.pathname.match(/\/object\/public\/covers\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  const authError = await getAuthError();
  if (authError)
    return { success: false, errors: { _form: [authError] } };

  const supabase = createServiceClient();

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("cover_url")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return { success: false, errors: { _form: ["Post no encontrado"] } };
  }

  if (post.cover_url) {
    const path = extractStoragePath(post.cover_url);
    if (path) {
      await supabase.storage.from("covers").remove([path]);
    }
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return {
      success: false,
      errors: { _form: ["No se pudo eliminar la publicación"] },
    };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
