import AdminLayout from './AdminLayout';

const ToolsAdminPage = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-manga-text mb-4">Admin Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="card p-4 text-left hover:bg-manga-surface">Reindex Search</button>
        <button className="card p-4 text-left hover:bg-manga-surface">Image Sweeper</button>
        <button className="card p-4 text-left hover:bg-manga-surface">Invalidate Cache</button>
      </div>
    </AdminLayout>
  );
};

export default ToolsAdminPage;


