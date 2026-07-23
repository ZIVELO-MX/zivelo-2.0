export default function AdminLoading() {
  return (
    <div className="admin-loading" aria-busy="true" aria-label="Cargando panel">
      <div className="admin-skeleton admin-skeleton--title" />
      <div className="admin-skeleton-grid">
        <div className="admin-skeleton" />
        <div className="admin-skeleton" />
        <div className="admin-skeleton" />
      </div>
      <div className="admin-skeleton admin-skeleton--table" />
    </div>
  );
}
