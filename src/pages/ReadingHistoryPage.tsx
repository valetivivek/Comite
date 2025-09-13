import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import { dataService } from '../services/dataService';
import { ReadingHistory, Series } from '../types';

const ReadingHistoryPage = () => {
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [historyData, seriesData] = await Promise.all([
          dataService.getReadingHistory(),
          dataService.getSeries()
        ]);
        setHistory(historyData);
        setSeries(seriesData);
      } catch (error) {
        console.error('Error loading reading history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getSeriesById = (seriesId: string) => {
    return series.find(s => s.id === seriesId);
  };

  const getChapterById = (seriesId: string, chapterId: string) => {
    const series = getSeriesById(seriesId);
    return series?.chapters.find(c => c.id === chapterId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-midnight-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-manga-bg">
      <div className="px-4 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-manga-text mb-2">Reading History</h1>
            <p className="text-manga-muted">Track your reading progress and continue where you left off</p>
          </div>

          {/* History List */}
          {history.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 text-manga-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-manga-text mb-2">No reading history</h3>
              <p className="text-manga-muted mb-6">Start reading some chapters to see your history here</p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-midnight-primary-600 hover:bg-midnight-primary-700 text-white rounded-lg transition-colors"
              >
                Browse Series
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => {
                const seriesData = getSeriesById(item.seriesId);
                const chapterData = getChapterById(item.seriesId, item.chapterId);
                
                if (!seriesData || !chapterData) return null;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex p-4">
                      {/* Cover Image */}
                      <div className="relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden">
                        <Link to={`/series/${seriesData.id}`}>
                          <img
                            src={seriesData.coverImage}
                            alt={seriesData.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </Link>
                      </div>

                      {/* Content */}
                      <div className="flex-1 ml-4 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/series/${seriesData.id}`}
                              className="block"
                            >
                              <h3 className="font-semibold text-manga-text truncate mb-1 hover:text-midnight-primary-400 transition-colors">
                                {seriesData.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-manga-muted mb-2">{seriesData.author}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-manga-muted mb-2">
                              <span>Chapter {chapterData.chapterNumber}</span>
                              <span>•</span>
                              <span>{Math.round(item.progress * 100)}% complete</span>
                            </div>

                            <div className="flex items-center text-xs text-manga-muted">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Read {new Date(item.readAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 ml-4">
                            <Link
                              to={`/series/${seriesData.id}/chapter/${chapterData.id}`}
                              className="inline-flex items-center px-3 py-1 bg-midnight-primary-600 hover:bg-midnight-primary-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Continue Reading
                            </Link>
                            <Link
                              to={`/series/${seriesData.id}`}
                              className="inline-flex items-center px-3 py-1 border border-manga-border hover:bg-manga-surface text-manga-text text-sm rounded-lg transition-colors"
                            >
                              View Series
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingHistoryPage;
