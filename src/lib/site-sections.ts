import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createServiceClient } from "@/lib/supabase/service";

export const SECTION_KEYS = [
  "about",
  "services",
  "projects",
  "process",
  "blog",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];
export type SectionVisibility = Record<SectionKey, boolean>;

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  about: true,
  services: true,
  projects: true,
  process: true,
  blog: true,
};

export class SiteSectionsError extends Error {
  constructor(message = "No se pudo cargar la configuración de secciones") {
    super(message);
    this.name = "SiteSectionsError";
  }
}

function toVisibility(
  rows: Pick<Database["public"]["Tables"]["site_sections"]["Row"], "section_key" | "enabled">[] | null,
): SectionVisibility {
  const visibility = { ...DEFAULT_SECTION_VISIBILITY };
  for (const row of rows ?? []) {
    if (SECTION_KEYS.includes(row.section_key as SectionKey)) {
      visibility[row.section_key as SectionKey] = row.enabled;
    }
  }
  return visibility;
}

const publicClient = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export const getPublicSectionVisibility = cache(async (): Promise<SectionVisibility> => {
  const { data, error } = await publicClient
    .from("site_sections")
    .select("section_key, enabled");

  if (error) {
    console.error("site_sections.public_read", error.code, error.message);
    return DEFAULT_SECTION_VISIBILITY;
  }

  return toVisibility(data);
});

export const getAdminSectionVisibility = cache(async (): Promise<SectionVisibility> => {
  const { data, error } = await createServiceClient()
    .from("site_sections")
    .select("section_key, enabled");

  if (error) throw new SiteSectionsError();
  return toVisibility(data);
});

export function isSectionEnabled(visibility: SectionVisibility, key: SectionKey) {
  return visibility[key];
}
