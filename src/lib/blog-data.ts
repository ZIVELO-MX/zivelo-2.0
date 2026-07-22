import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export type BlogPost = {
  slug: string;
  tag: { es: string; en: string };
  title: { es: string; en: string };
  summary: { es: string; en: string };
  contentHtml: { es: string; en: string };
  author: string;
  readMin: number;
  publishedAt: string;
};

function toBlogPost(row: PostRow): BlogPost {
  return {
    slug: row.slug,
    tag: { es: row.tag_es, en: row.tag_en },
    title: { es: row.title_es, en: row.title_en },
    summary: { es: row.summary_es, en: row.summary_en },
    contentHtml: { es: row.content_html_es, en: row.content_html_en },
    author: row.author,
    readMin: row.read_min,
    publishedAt: row.published_at ?? "",
  };
}

export async function listPosts(tag?: string): Promise<BlogPost[]> {
  const supabase = createClient();
  let query = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (tag && tag !== "*") {
    query = query.or(`tag_es.eq.${tag},tag_en.eq.${tag}`);
  }

  const { data } = await query;
  return (data ?? []).map(toBlogPost);
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return data ? toBlogPost(data) : null;
}

export async function listTags(locale: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("posts")
    .select("tag_es, tag_en")
    .eq("status", "published");

  if (!data) return [];

  const key = locale === "en" ? "tag_en" : "tag_es";
  const seen = new Set<string>();
  for (const row of data) {
    const tag = row[key as keyof typeof row];
    if (tag) seen.add(tag);
  }
  return Array.from(seen);
}

export async function listSlugs(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published");

  return (data ?? []).map((row) => row.slug);
}
