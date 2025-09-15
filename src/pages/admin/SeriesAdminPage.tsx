import { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { dataService } from '../../services/dataService';
import { Series } from '../../types';

const blank = { title: '', author: '', description: '', coverImage: '', status: 'ongoing' as const, genre: [] as string[] };

const SeriesAdminPage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<any>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const s = await dataService.getSeries();
      setSeries(s);
      setIsLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => series.filter(s => s.title.toLowerCase().includes(query.toLowerCase())), [series, query]);

  const startEdit = (id: string) => {
    const s = series.find(x => x.id === id);
    if (!s) return;
    setEditingId(id);
    setForm({ title: s.title, author: s.author, description: s.description, coverImage: s.coverImage, status: s.status, genre: s.genre });
  };

  const resetForm = () => { setEditingId(null); setForm(blank); };

  const save = async () => {
    try {
      if (editingId) {
        const current = series.find(s => s.id === editingId);
        if (current) {
          const updated = { ...current, ...form } as Series;
          await dataService.updateSeries(updated);
          const next = series.map(s => s.id === editingId ? updated : s);
          setSeries(next);
        }
        setToast('Series updated');
      } else {
        const id = `series-${Date.now()}`;
        const s: Series = {
          id,
          title: form.title,
          author: form.author || 'Unknown',
          description: form.description,
          coverImage: form.coverImage || '',
          bannerImage: '',
          tags: [],
          status: form.status || 'ongoing',
          genre: form.genre || [],
          rating: 0,
          totalChapters: 0,
          lastUpdated: new Date().toISOString(),
          firstChapterPublishedAt: new Date().toISOString(),
          uploadedAt: new Date().toISOString(),
          chapters: []
        };
        await dataService.addSeries(s);
        setSeries([s, ...series]);
        setToast('Series created');
      }
      resetForm();
    } catch (e) {
      setToast('Save failed');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-manga-text">Manage Series</h1>
        <div className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search series" className="input w-64" />
          <button className="btn-primary" onClick={() => { resetForm(); }}>Add Series</button>
        </div>
      </div>

      {(editingId !== null || form.title) && (
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
            </div>
            <div>
              <label className="label">Author</label>
              <input className="input" value={form.author} onChange={e=>setForm({...form, author:e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
            </div>
            <div>
              <label className="label">Cover URL</label>
              <input className="input" value={form.coverImage} onChange={e=>setForm({...form, coverImage:e.target.value})} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="btn-primary" onClick={save} disabled={!form.title}>Save</button>
            <button className="btn-secondary" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-manga-surface text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Chapters</th>
              <th className="p-3">Updated</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-3 text-manga-muted" colSpan={5}>Loading...</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="border-t border-manga-border">
                <td className="p-3 text-manga-text">{s.title}</td>
                <td className="p-3 text-manga-muted">{s.status}</td>
                <td className="p-3 text-manga-muted">{s.totalChapters}</td>
                <td className="p-3 text-manga-muted">{new Date(s.lastUpdated).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button className="text-manga-accent" onClick={() => startEdit(s.id)}>Edit</button>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td className="p-3 text-manga-muted" colSpan={5}>No series</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 card px-4 py-2" role="status" aria-live="polite">{toast}</div>
      )}
    </AdminLayout>
  );
};

export default SeriesAdminPage;


