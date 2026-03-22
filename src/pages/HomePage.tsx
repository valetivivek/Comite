import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { dataService } from '../services/dataService';
import { ReadingHistory, Series } from '../types';
import Carousel from '../components/Carousel';
import HeroAnnouncementPill from '../components/HeroAnnouncementPill';
import { HeroSection } from '../components/ui/hero-odyssey';

const HomePage = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [seriesData, historyData] = await Promise.all([
          dataService.getSeries(),
          dataService.getReadingHistory(),
        ]);
        setSeries(seriesData);
        setHistory(historyData);
      } catch (error) {
        console.error('Error loading welcome page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const topSeries = [...series].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const latestHistory = history[0];
  const resumeSeries = latestHistory
    ? series.find((item) => item.id === latestHistory.seriesId)
    : null;
  const resumeChapter = latestHistory && resumeSeries
    ? resumeSeries.chapters.find((chapter) => chapter.id === latestHistory.chapterId)
    : null;

  const quickPaths = [
    {
      to: '/popular',
      label: 'Popular now',
      note: 'Open the highest-rated shelves without sifting through everything.',
      accent: 'from-manga-accent/25 via-manga-accent/10 to-transparent',
    },
    {
      to: '/new-releases',
      label: 'New this week',
      note: 'Check recent uploads and recently started series in one pass.',
      accent: 'from-manga-success/25 via-manga-success/10 to-transparent',
    },
    {
      to: '/history',
      label: 'Reading history',
      note: resumeSeries
        ? 'Pick up the last chapter you touched and keep moving.'
        : 'Your recent sessions will appear here once you start reading.',
      accent: 'from-manga-accent/25 via-manga-accent/10 to-transparent',
    },
  ];

  const actionButtonBase =
    'group relative inline-flex min-h-[52px] items-center overflow-hidden rounded-full border px-6 pr-16 text-sm font-semibold tracking-[0.01em] transition-all duration-300';

  const heroAnnouncement = resumeSeries && resumeChapter
    ? {
        to: `/series/${resumeSeries.id}/chapter/${resumeChapter.id}`,
        announcement: 'Resume Ready',
        label: `${resumeSeries.title} - Ch. ${resumeChapter.chapterNumber}`,
      }
    : {
        to: '/new-releases',
        announcement: 'Fresh Shelf',
        label: 'See what landed this week',
      };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-manga-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-bg">
      <div className="px-4 sm:px-6 lg:px-8 mt-2 mb-8">
        <HeroSection />
      </div>
      <section className="mobile-container pt-2 pb-12 sm:pt-4 sm:pb-16 lg:pt-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <div className="relative overflow-hidden rounded-[32px] border border-manga-border/80 bg-manga-card/85 px-5 py-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.9)] backdrop-blur sm:px-7 sm:py-8 lg:px-8">
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-manga-accent/18 blur-3xl" />
                <div className="absolute right-0 top-16 h-40 w-40 rounded-full bg-manga-warning/14 blur-3xl" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-manga-accent/50 to-transparent" />
              </div>

              <div className="relative">
                <HeroAnnouncementPill
                  to={heroAnnouncement.to}
                  announcement={heroAnnouncement.announcement}
                  label={heroAnnouncement.label}
                />
                <p className="eyebrow mt-5">
                  Reading-first shelf
                </p>
                <h1 className="heading-1 mt-4 max-w-[14ch]">
                  Find a series. Open a chapter. Keep your place.
                </h1>
                <p className="body-large mt-4 max-w-[34rem]">
                  ComiTe keeps discovery, progress, and reading history close at hand without the
                  clutter of a typical comic portal.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    to="/"
                    className={`${actionButtonBase} border-transparent bg-manga-accent text-manga-on-accent shadow-[0_16px_40px_-24px_rgba(180,83,9,0.5)] hover:bg-manga-accent-hover`}
                  >
                    <span className="transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-90">
                      Browse library
                    </span>
                    <span className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-all duration-300 group-hover:right-[calc(100%-2.75rem)] group-hover:rotate-45">
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </Link>
                  {resumeSeries && resumeChapter ? (
                    <Link
                      to={`/series/${resumeSeries.id}/chapter/${resumeChapter.id}`}
                      className={`${actionButtonBase} border-manga-border bg-manga-surface/85 text-manga-text shadow-[0_16px_40px_-30px_rgba(15,23,42,0.8)] hover:border-manga-accent/40 hover:bg-manga-card`}
                    >
                      <span className="transition-all duration-300 group-hover:-translate-x-1">
                        Resume chapter {resumeChapter.chapterNumber}
                      </span>
                      <span className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full bg-manga-card transition-all duration-300 group-hover:right-[calc(100%-2.75rem)] group-hover:text-manga-accent">
                        <ClockIcon className="h-4 w-4" />
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to="/popular"
                      className={`${actionButtonBase} border-manga-border bg-manga-surface/85 text-manga-text shadow-[0_16px_40px_-30px_rgba(15,23,42,0.8)] hover:border-manga-accent/40 hover:bg-manga-card`}
                    >
                      <span className="transition-all duration-300 group-hover:-translate-x-1">
                        See popular
                      </span>
                      <span className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full bg-manga-card transition-all duration-300 group-hover:right-[calc(100%-2.75rem)] group-hover:rotate-45 group-hover:text-manga-accent">
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </Link>
                  )}
                </div>

                {resumeSeries && resumeChapter && (
                  <div className="mt-8 border-t border-manga-border pt-5">
                    <p className="eyebrow">Last open</p>
                    <Link
                      to={`/series/${resumeSeries.id}/chapter/${resumeChapter.id}`}
                      className="group relative mt-3 flex items-center justify-between gap-4 overflow-hidden rounded-[24px] border border-manga-border bg-manga-surface/80 px-4 py-4 transition-all duration-300 hover:border-manga-accent/40 hover:bg-manga-card"
                    >
                      <span className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-manga-accent/18 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                      <div className="relative min-w-0">
                        <p className="truncate text-base font-semibold tracking-[-0.015em] text-manga-text">
                          {resumeSeries.title}
                        </p>
                        <p className="mt-1 text-sm text-manga-text-secondary">
                          Chapter {resumeChapter.chapterNumber}
                        </p>
                      </div>
                      <div className="relative flex items-center gap-2 text-sm text-manga-muted transition-colors duration-300 group-hover:text-manga-accent">
                        <ClockIcon className="h-4 w-4" />
                        <span>Resume</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {quickPaths.map((path) => (
                <Link
                  key={path.to}
                  to={path.to}
                  className="group relative overflow-hidden rounded-[24px] border border-manga-border/80 bg-manga-card/70 px-4 py-4 transition-all duration-300 hover:border-manga-accent/35 hover:bg-manga-card"
                >
                  <span
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${path.accent} opacity-80`}
                    aria-hidden="true"
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-semibold tracking-[-0.015em] text-manga-text transition-colors group-hover:text-manga-accent">
                        {path.label}
                      </p>
                      <p className="mt-1 max-w-md text-sm leading-6 text-manga-muted">
                        {path.note}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-manga-border bg-manga-surface/85 text-manga-muted transition-all duration-300 group-hover:border-manga-accent/40 group-hover:text-manga-accent">
                      <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:pt-3"
          >
            <div className="group relative overflow-hidden rounded-[32px] p-[1px] shadow-[0_26px_90px_-48px_rgba(15,23,42,0.95)]">
              <div
                className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,102,241,0.22),rgba(148,163,184,0.08),rgba(99,102,241,0.18),rgba(99,102,241,0.22))] transition-transform duration-700 group-hover:rotate-180"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-[31px] border border-manga-border/80 bg-manga-card">
                <div className="pointer-events-none absolute -right-10 top-10 h-32 w-32 rounded-full bg-manga-accent/15 blur-3xl" aria-hidden="true" />
                <div className="mb-4 flex items-end justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
                  <div>
                    <p className="eyebrow">
                      Featured shelf
                    </p>
                    <h2 className="heading-3 mt-2">
                      Quiet picks for tonight
                    </h2>
                  </div>
                  <Link
                    to="/popular"
                    className="inline-flex h-10 items-center rounded-full border border-manga-border bg-manga-surface/85 px-4 text-sm font-medium text-manga-text transition-all duration-300 hover:border-manga-accent/40 hover:text-manga-accent"
                  >
                    Popular
                  </Link>
                </div>
                <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                  <div className="overflow-hidden rounded-[26px] border border-manga-border bg-manga-card">
                    <div className="h-[340px] sm:h-[400px] lg:h-[440px]">
                      <Carousel series={topSeries} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
