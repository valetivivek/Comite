import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SearchFilters } from '../types';

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const SearchFiltersModal = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange 
}: SearchFiltersModalProps) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural'
  ];

  const statuses = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'hiatus', label: 'Hiatus' }
  ];

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'lastUpdated', label: 'Last Updated' },
    { value: 'rating', label: 'Rating' },
    { value: 'totalChapters', label: 'Chapters' }
  ];

  const handleGenreToggle = (genre: string) => {
    setLocalFilters(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  const handleStatusToggle = (status: string) => {
    setLocalFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: '',
      genre: [],
      status: [],
      sortBy: 'lastUpdated',
      sortOrder: 'desc'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-manga-card rounded-xl shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-manga-border">
                <h2 className="text-xl font-semibold text-manga-text">Search Filters</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-manga-surface rounded-lg transition-colors jitter-hover"
                >
                  <XMarkIcon className="h-5 w-5 text-manga-muted" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Sort Options */}
                <div>
                  <h3 className="text-sm font-medium text-manga-text mb-3">Sort By</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {sortOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="sortBy"
                          value={option.value}
                          checked={localFilters.sortBy === option.value}
                          onChange={(e) => setLocalFilters(prev => ({
                            ...prev,
                            sortBy: e.target.value as any
                          }))}
                          className="mr-2 text-midnight-primary-600 focus:ring-midnight-primary-500"
                        />
                        <span className="text-sm text-manga-text">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="asc"
                        checked={localFilters.sortOrder === 'asc'}
                        onChange={(e) => setLocalFilters(prev => ({
                          ...prev,
                          sortOrder: e.target.value as 'asc' | 'desc'
                        }))}
                        className="mr-2 text-midnight-primary-600 focus:ring-midnight-primary-500"
                      />
                      <span className="text-sm text-manga-text">Ascending</span>
                    </label>
                    <label className="flex items-center ml-6">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="desc"
                        checked={localFilters.sortOrder === 'desc'}
                        onChange={(e) => setLocalFilters(prev => ({
                          ...prev,
                          sortOrder: e.target.value as 'asc' | 'desc'
                        }))}
                        className="mr-2 text-midnight-primary-600 focus:ring-midnight-primary-500"
                      />
                      <span className="text-sm text-manga-text">Descending</span>
                    </label>
                  </div>
                </div>

                {/* Genres */}
                <div>
                  <h3 className="text-sm font-medium text-manga-text mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          localFilters.genre.includes(genre)
                            ? 'bg-midnight-primary-600 text-white'
                            : 'bg-manga-surface text-manga-text hover:bg-manga-border'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-manga-text mb-3">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusToggle(status.value)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          localFilters.status.includes(status.value)
                            ? 'bg-midnight-primary-600 text-white'
                            : 'bg-manga-surface text-manga-text hover:bg-manga-border'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-manga-border">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-manga-muted hover:text-manga-text transition-colors"
                >
                  Reset
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    className="btn-primary"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchFiltersModal;
