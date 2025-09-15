import { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { dataService } from '../../services/dataService';
import { Series } from '../../types';

const ChaptersAdminPage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [seriesId, setSeriesId] = useState('');
  const [orderAsc, setOrderAsc] = useState(true);

  useEffect(() => {
    dataService.getSeries().then(setSeries);
  }, []);

  const selected = useMemo(() => series.find(s => s.id === seriesId) || null, [series, seriesId]);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-manga-text mb-4">Manage Chapters</h1>
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="label">Series</label>
            <select className="input" value={seriesId} onChange={e=>setSeriesId(e.target.value)}>
              <option value="">Select series</option>
              {series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Order</label>
            <select className="input" value={orderAsc ? 'asc' : 'desc'} onChange={e=>setOrderAsc(e.target.value==='asc')}>
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary">Bulk Upload (mock)</button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-manga-surface text-left">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Title</th>
                <th className="p-3">Published</th>
              </tr>
            </thead>
            <tbody>
              {(orderAsc ? [...selected.chapters].reverse() : selected.chapters).map(ch => (
                <tr key={ch.id} className="border-t border-manga-border">
                  <td className="p-3 text-manga-text">{ch.chapterNumber}</td>
                  <td className="p-3 text-manga-muted">{ch.title}</td>
                  <td className="p-3 text-manga-muted">{new Date(ch.publishedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default ChaptersAdminPage;


