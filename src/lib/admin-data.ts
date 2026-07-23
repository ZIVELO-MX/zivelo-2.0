import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export type AdminPost = {
  id: string;
  slug: string;
  status: string;
  title_es: string;
  title_en: string;
  tag_es: string;
  tag_en: string;
  author: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function toAdminPost(row: PostRow): AdminPost {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    title_es: row.title_es,
    title_en: row.title_en,
    tag_es: row.tag_es,
    tag_en: row.tag_en,
    author: row.author,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getDashboardStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
}> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("posts").select("status");
  if (!data) return { total: 0, published: 0, drafts: 0 };
  return {
    total: data.length,
    published: data.filter((r) => r.status === "published").length,
    drafts: data.filter((r) => r.status === "draft").length,
  };
}

export async function listAllPosts(): Promise<AdminPost[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data ?? []).map(toAdminPost);
}
