import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bars3Icon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { dataService } from '../../services/dataService';
import { Series } from '../../types';
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility';
import BrandLogo from '../../components/BrandLogo';

interface Props { children: ReactNode }
interface AdminNavItem {
  to: string;
  label: string;
  end?: boolean;
}

const AdminLayout = ({ children }: Props) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState<Series[]>([]);
  const paletteRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navItems: AdminNavItem[] = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/series', label: 'Series' },
    { to: '/admin/chapters', label: 'Chapters' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/tools', label: 'Tools' },
    { to: '/admin/upload', label: 'Upload' },
  ];

  useEffect(() => { dataService.getSeries().then(setSeries); }, []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [] as Series[];
    return series.filter(s => s.title.toLowerCase().includes(q)).slice(0,8);
  }, [query, series]);

  const closePalette = () => {
    setIsPaletteOpen(false);
    setQuery('');
  };

  const openPalette = () => {
    setIsMobileNavOpen(false);
    setIsPaletteOpen(true);
  };

  useDialogAccessibility({
    isOpen: isPaletteOpen,
    onClose: closePalette,
    containerRef: paletteRef
  });

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
    setIsMobileNavOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey;
      if (isMod && (e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsPaletteOpen((isOpen) => {
          const nextIsOpen = !isOpen;
          if (!nextIsOpen) {
            setQuery('');
          }
          return nextIsOpen;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-manga-bg">
      <header className="sticky top-0 z-30 border-b border-manga-border bg-manga-card backdrop-blur-sm">
        <div className="container-spacing flex items-center gap-3 py-3 md:py-4">
          <div className="min-w-0 flex-1">
            <Link to="/admin" className="inline-flex items-center gap-3" aria-label="Admin home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-manga-border bg-manga-surface shadow-[0_16px_40px_-28px_rgba(15,23,42,0.9)]">
                <BrandLogo variant="mark" className="h-6 w-6" />
              </span>
              <span className="text-xl font-bold text-manga-text">ComiTe Admin</span>
            </Link>
            <p className="mt-1 text-xs text-manga-muted md:hidden">Quick edits, uploads, and review tools.</p>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex items-center gap-4 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => isActive ? 'text-manga-accent' : 'text-manga-text'}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              onClick={openPalette}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-manga-border bg-manga-surface px-3 py-2 text-sm text-manga-text transition-colors hover:bg-manga-border focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-bg"
              aria-label="Jump to series"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Jump to Series
              <span className="text-xs text-manga-muted">Ctrl/Cmd+K</span>
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={openPalette}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-manga-border bg-manga-surface px-3 py-2 text-sm text-manga-text transition-colors hover:bg-manga-border focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-bg"
              aria-label="Jump to series"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Jump
            </button>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((open) => !open)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-manga-border bg-manga-surface text-manga-text transition-colors hover:bg-manga-border focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-bg"
              aria-controls="admin-mobile-nav"
              aria-expanded={isMobileNavOpen}
              aria-label={isMobileNavOpen ? 'Close admin navigation' : 'Open admin navigation'}
            >
              {isMobileNavOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      {isMobileNavOpen && (
        <div id="admin-mobile-nav" className="border-b border-manga-border bg-manga-card md:hidden">
          <div className="container-spacing py-3">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => isActive
                    ? 'flex min-h-[44px] items-center rounded-lg bg-manga-accent px-3 py-3 text-sm font-medium text-manga-on-accent'
                    : 'flex min-h-[44px] items-center rounded-lg border border-manga-border bg-manga-surface px-3 py-3 text-sm font-medium text-manga-text'
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
      <main className="container-spacing py-6">
        {children}
      </main>
      {isPaletteOpen && (
        <div className="theme-backdrop fixed inset-0 z-50 px-4 py-6 md:px-0" onClick={closePalette}>
          <div className="mx-auto mt-10 w-full max-w-xl md:mt-24" onClick={e=>e.stopPropagation()}>
            <div
              ref={paletteRef}
              className="card max-h-[calc(100vh-5rem)] overflow-hidden p-2"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-command-palette-title"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between px-2 pb-2">
                <h2 id="admin-command-palette-title" className="text-sm font-semibold text-manga-text">
                  Jump to Series
                </h2>
                <button
                  type="button"
                  onClick={closePalette}
                  className="rounded-lg p-2 text-manga-muted hover:bg-manga-surface hover:text-manga-text transition-colors"
                  aria-label="Close command palette"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <input
                autoFocus
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="Search series..."
                className="input w-full"
                aria-label="Search series"
              />
              <ul className="mt-2 max-h-[min(55vh,16rem)] overflow-auto">
                {results.map(r => (
                  <li key={r.id}>
                    <Link
                      to={`/admin/series?edit=${r.id}`}
                      onClick={closePalette}
                      className="flex min-h-[44px] items-center rounded-lg px-3 py-3 text-manga-text transition-colors hover:bg-manga-surface"
                    >
                      {r.title}
                    </Link>
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


