"use server";

import { auth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { SECTION_KEYS, type SectionKey, type SectionVisibility } from "@/lib/site-sections";
import { revalidatePath } from "next/cache";

export type SiteSectionsActionResult =
  | { success: true; sections: SectionVisibility }
  | { success: false; message: string };

function isBooleanValue(value: FormDataEntryValue | null): value is "true" | "false" {
  return value === "true" || value === "false";
}

function readFormData(formData: FormData): SectionVisibility | null {
  const values = Object.fromEntries(
    SECTION_KEYS.map((key) => [key, formData.get(key)]),
  ) as Record<SectionKey, FormDataEntryValue | null>;

  if (!SECTION_KEYS.every((key) => isBooleanValue(values[key]))) return null;

  return Object.fromEntries(
    SECTION_KEYS.map((key) => [key, values[key] === "true"]),
  ) as SectionVisibility;
}

export async function updateSiteSections(
  _previous: SiteSectionsActionResult,
  formData: FormData,
): Promise<SiteSectionsActionResult> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return { success: false, message: "Tu sesión expiró. Inicia sesión de nuevo." };

  const sections = readFormData(formData);
  if (!sections) return { success: false, message: "La configuración recibida no es válida." };

  const supabase = createServiceClient();
  const { data: admin, error: authError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .eq("role", "admin")
    .maybeSingle();

  if (authError) {
    console.error("site_sections.authorize", authError.code, authError.message);
    return { success: false, message: "No se pudo verificar tu acceso. Inténtalo de nuevo." };
  }
  if (!admin) return { success: false, message: "Tu cuenta no tiene permisos para cambiar esta configuración." };

  const { error } = await supabase.from("site_sections").upsert(
    SECTION_KEYS.map((section_key) => ({ section_key, enabled: sections[section_key] })),
    { onConflict: "section_key" },
  );

  if (error) {
    console.error("site_sections.update", error.code, error.message);
    return { success: false, message: "No se pudo guardar la configuración. Inténtalo de nuevo." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  return { success: true, sections };
}
