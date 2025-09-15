import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Series } from '../types';

const PAGE_SIZE = 24;

const getSeriesStartDate = (s: Series): Date | null => {
  const candidates = [s.firstChapterPublishedAt, s.uploadedAt].filter(Boolean) as string[];
  if (candidates.length === 0) return null;
  const earliest = candidates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime())[0];
  return earliest;
};

const isWithinLast7Days = (date: Date | null): boolean => {
  if (!date) return false;
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7 && diffDays >= 0;
};

const SkeletonCard = () => (
  <div className="card p-3 animate-pulse">
    <div className="flex gap-3">
      <div className="w-[90px] sm:w-[100px] lg:w-[110px] aspect-[3/4] bg-manga-surface rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-manga-surface rounded w-2/3" />
        <div className="h-3 bg-manga-surface rounded w-1/3" />
        <div className="h-3 bg-manga-surface rounded w-1/2" />
      </div>
    </div>
  </div>
);

const NewReleasesPage = () => {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const s = await dataService.getSeries();
        setAllSeries(s);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return allSeries
      .filter(s => s.totalChapters >= 10 && s.totalChapters <= 15)
      .map(s => ({ series: s, startDate: getSeriesStartDate(s) }))
      .filter(({ startDate }) => isWithinLast7Days(startDate))
      .sort((a, b) => (b.startDate!.getTime()) - (a.startDate!.getTime()))
      .map(({ series }) => series);
  }, [allSeries]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="min-h-screen bg-manga-bg">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-manga-text">New Releases</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="card p-8 text-center">
            <h2 className="text-xl font-semibold text-manga-text mb-2">No new releases this week</h2>
            <p className="text-manga-muted">Check back later or explore popular series instead.</p>
            <div className="mt-4">
              <Link to="/popular" className="btn-secondary">View Popular</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pageItems.map((s) => (
                <Link to={`/series/${s.id}`} key={s.id} className="card p-3 hover:shadow-xl transition-shadow">
                  <div className="flex gap-3">
                    <img src={s.coverImage} alt={s.title} className="w-[90px] sm:w-[100px] lg:w-[110px] aspect-[3/4] object-cover rounded" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-manga-text truncate" title={s.title}>{s.title}</h3>
                      <p className="text-sm text-manga-muted truncate">by {s.author}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-manga-muted">{s.totalChapters} ch</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-manga-accent/20 text-manga-accent border border-manga-accent/30">New</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  const isActive = p === currentPage;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-manga-accent text-white' : 'border border-manga-border hover:bg-manga-surface text-manga-text'}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewReleasesPage;


