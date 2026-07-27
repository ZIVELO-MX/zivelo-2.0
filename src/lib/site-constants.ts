/**
 * Site-wide contact info and external project links, single-sourced. Before
 * this, the email/phone/WhatsApp number were hardcoded in 5-6 files each
 * (header, footer, mobile nav, contact page, home page, layout JSON-LD) and
 * every project URL was hardcoded in 3 files (home page, projects page,
 * footer) — a phone or link change meant hunting across the codebase.
 */
export const CONTACT = {
  email: "contacto@zivelo.dev",
  phoneDisplay: "+52 1 392 110 7274",
  phoneTel: "+5213921107274",
  whatsappUrl: "https://wa.me/5213921107274",
} as const;

export const PROJECT_LINKS = {
  kodaFidelity: "https://fidelity.zivelo.dev",
  stickio: "https://stickio.vercel.app/",
  ziveloQuotes: "https://quotes.zivelo.dev/",
  prompt2git: "https://prompt2git.zivelo.dev",
} as const;

const STORAGE_BASE = "https://yauzyuewbhzodzkynond.supabase.co/storage/v1/object/public/covers/projects" as const;

export const PROJECT_COVERS: Record<string, string> = {
  kodaFidelity: `${STORAGE_BASE}/Cover-Fidelity.png`,
  stickio: `${STORAGE_BASE}/Cover-Stickio.png`,
  prompt2git: `${STORAGE_BASE}/Cover-Prompt2Git.png`,
};
