"use client";

export default function AdminError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <div className="admin-gate">
      <div className="admin-gate__card" role="alert">
        <span className="eyebrow">Error del panel</span>
        <h1 className="h3" style={{ marginTop: 16 }}>No pudimos cargar tus publicaciones</h1>
        <p style={{ marginTop: 10 }}>Intenta de nuevo. Si el problema continúa, revisa la conexión con Supabase.</p>
        <button className="btn btn--primary btn--sm" type="button" onClick={() => unstable_retry()} style={{ marginTop: 24 }}>
          Reintentar
        </button>
      </div>
    </div>
  );
}
