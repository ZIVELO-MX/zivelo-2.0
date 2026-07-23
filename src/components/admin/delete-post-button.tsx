"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { deletePost } from "@/lib/actions/posts";

export function DeletePostButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return <button className="btn btn--ghost btn--sm" type="button" disabled={pending} onClick={() => { if (!window.confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return; startTransition(async () => { const result = await deletePost(postId); if (result.success) router.push("/admin/dashboard"); }); }}>{pending ? "Eliminando…" : "Eliminar"}</button>;
}
