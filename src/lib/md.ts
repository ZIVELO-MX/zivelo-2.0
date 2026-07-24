import { marked } from "marked";
import { sanitizeHtml } from "@/lib/sanitize";

export async function markdownToSafeHtml(md: string): Promise<string> {
  const raw = await marked.parse(md, { async: true });
  return sanitizeHtml(raw);
}
