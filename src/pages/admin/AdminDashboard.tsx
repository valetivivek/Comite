import { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { dataService } from '../../services/dataService';
import { Series } from '../../types';

const AdminDashboard = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const s = await dataService.getSeries();
      setSeries(s);
      setIsLoading(false);
    };
    load();
  }, []);

  const totalSeries = series.length;
  const totalChapters = useMemo(() => series.reduce((sum, s) => sum + s.totalChapters, 0), [series]);
  const recentUploads = useMemo(
    () => [...series].sort((a,b) => new Date(b.uploadedAt || b.lastUpdated).getTime() - new Date(a.uploadedAt || a.lastUpdated).getTime()).slice(0,5),
    [series]
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-manga-text">Overview</h1>
        <div className="flex gap-2">
          <a href="/admin/series" className="btn-primary">Add Series</a>
          <a href="/admin/chapters" className="btn-secondary">Bulk Upload</a>
          <a href="/admin/tools" className="btn-secondary">Review Reports</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4"><p className="text-manga-muted text-sm">Total Series</p><p className="text-3xl font-bold text-manga-text">{isLoading ? '—' : totalSeries}</p></div>
        <div className="card p-4"><p className="text-manga-muted text-sm">Total Chapters</p><p className="text-3xl font-bold text-manga-text">{isLoading ? '—' : totalChapters}</p></div>
        <div className="card p-4"><p className="text-manga-muted text-sm">Active Users (7d)</p><p className="text-3xl font-bold text-manga-text">—</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h2 className="font-semibold text-manga-text mb-2">New Series (14d)</h2>
          <div className="h-40 flex items-center justify-center text-manga-muted text-sm">Chart coming soon</div>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold text-manga-text mb-2">Reads per Day (14d)</h2>
          <div className="h-40 flex items-center justify-center text-manga-muted text-sm">Chart coming soon</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold text-manga-text mb-3">Recent uploads</h2>
          <div className="divide-y divide-manga-border">
            {recentUploads.map(s => (
              <div key={s.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="text-manga-text font-medium">{s.title}</p>
                  <p className="text-manga-muted text-sm">Updated {new Date(s.lastUpdated).toLocaleDateString()}</p>
                </div>
                <a href={`/admin/series?edit=${s.id}`} className="text-manga-accent text-sm">Edit</a>
              </div>
            ))}
            {recentUploads.length === 0 && <p className="text-manga-muted text-sm">No uploads yet</p>}
          </div>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold text-manga-text mb-3">Recent reports</h2>
          <div className="text-manga-muted text-sm">No reports in mock data</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;


