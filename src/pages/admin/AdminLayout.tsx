import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { Series } from '../../types';

interface Props { children: ReactNode }

const AdminLayout = ({ children }: Props) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState<Series[]>([]);

  useEffect(() => { dataService.getSeries().then(setSeries); }, []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [] as Series[];
    return series.filter(s => s.title.toLowerCase().includes(q)).slice(0,8);
  }, [query, series]);

  useEffect(() => {
    const metaId = 'robots-noindex';
    let meta = document.getElementById(metaId) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.id = metaId;
      document.head.appendChild(meta);
    }
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    // Best-effort no-store for SPA
    const noStoreId = 'cache-control-no-store';
    let metaCache = document.getElementById(noStoreId) as HTMLMetaElement | null;
    if (!metaCache) {
      metaCache = document.createElement('meta');
      metaCache.id = noStoreId;
      document.head.appendChild(metaCache);
    }
    metaCache.setAttribute('http-equiv', 'Cache-Control');
    metaCache.setAttribute('content', 'no-store');

    return () => {
      if (meta) {
        meta.remove();
      }
      if (metaCache) {
        metaCache.remove();
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey;
      if (isMod && (e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsPaletteOpen(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-manga-bg">
      <header className="border-b border-manga-border bg-manga-card">
        <div className="container-spacing flex items-center justify-between py-4">
          <Link to="/admin" className="text-xl font-bold text-manga-text" aria-label="Admin home">ComiTe Admin</Link>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/admin" end className={({isActive}) => isActive ? 'text-manga-accent' : 'text-manga-text'}>Dashboard</NavLink>
            <NavLink to="/admin/series" className={({isActive}) => isActive ? 'text-manga-accent' : 'text-manga-text'}>Series</NavLink>
            <NavLink to="/admin/chapters" className={({isActive}) => isActive ? 'text-manga-accent' : 'text-manga-text'}>Chapters</NavLink>
            <NavLink to="/admin/users" className={({isActive}) => isActive ? 'text-manga-accent' : 'text-manga-text'}>Users</NavLink>
            <NavLink to="/admin/tools" className={({isActive}) => isActive ? 'text-manga-accent' : 'text-manga-text'}>Tools</NavLink>
            <NavLink to="/admin/upload" className={({isActive}) => isActive ? 'text-manga-accent' : 'text-manga-text'}>Upload</NavLink>
          </nav>
        </div>
      </header>
      <main className="container-spacing py-6">
        {children}
      </main>
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsPaletteOpen(false)}>
          <div className="max-w-xl mx-auto mt-24" onClick={e=>e.stopPropagation()}>
            <div className="card p-2">
              <input
                autoFocus
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="Search series..."
                className="input w-full"
                aria-label="Search series"
              />
              <ul className="mt-2 max-h-64 overflow-auto">
                {results.map(r => (
                  <li key={r.id} className="px-3 py-2 hover:bg-manga-surface">
                    <a href={`/admin/series?edit=${r.id}`} className="block text-manga-text">{r.title}</a>
                  </li>
                ))}
                {results.length === 0 && query && (
                  <li className="px-3 py-2 text-manga-muted text-sm">No results</li>
                )}
              </ul>
              <div className="text-right text-manga-muted text-xs mt-2">Press Esc to close</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;


