"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <div className="admin-gate">
      <div className="admin-gate__card" role="alert">
        <span className="eyebrow">Error del panel</span>
        <h1 className="h3 admin-error__title">No pudimos cargar tus publicaciones</h1>
        <p className="admin-error__body">Intenta de nuevo. Si el problema continúa, revisa la conexión con Supabase.</p>
        <Button size="sm" className="admin-error__action" type="button" onClick={() => unstable_retry()}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
