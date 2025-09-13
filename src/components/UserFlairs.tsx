import { useEffect, useState } from 'react';
import { readingStatsService, ReadingStats } from '../services/readingStatsService';

interface UserFlairsProps {
  userId: string;
  variant?: 'dashboard' | 'comment';
  className?: string;
}

const UserFlairs = ({ userId, variant = 'dashboard', className = '' }: UserFlairsProps) => {
  const [flairs, setFlairs] = useState<{ rank: string; genres: string[] } | null>(null);

  useEffect(() => {
    const loadFlairs = () => {
      const userFlairs = readingStatsService.getUserFlairs(userId);
      setFlairs(userFlairs);
    };

    loadFlairs();
    
    // Listen for stats updates
    const handleStatsUpdate = () => loadFlairs();
    window.addEventListener('readingStatsUpdated', handleStatsUpdate);
    
    return () => {
      window.removeEventListener('readingStatsUpdated', handleStatsUpdate);
    };
  }, [userId]);

  if (!flairs) return null;

  const { rank, genres } = flairs;
  const displayGenres = variant === 'comment' ? genres.slice(0, 2) : genres.slice(0, 3);

  const getRankColor = (rank: string): string => {
    switch (rank) {
      case 'Archivist': return 'bg-purple-600 text-white';
      case 'Binger': return 'bg-blue-600 text-white';
      case 'Enthusiast': return 'bg-green-600 text-white';
      case 'Reader': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getGenreColor = (index: number): string => {
    const colors = [
      'bg-teal-500 text-white',
      'bg-orange-500 text-white',
      'bg-pink-500 text-white'
    ];
    return colors[index] || 'bg-gray-500 text-white';
  };

  const getSizeClasses = (variant: string) => {
    if (variant === 'comment') {
      return {
        rank: 'text-xs px-2 py-1',
        genre: 'text-xs px-1.5 py-0.5'
      };
    }
    return {
      rank: 'text-sm px-3 py-1.5',
      genre: 'text-sm px-2 py-1'
    };
  };

  const sizes = getSizeClasses(variant);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Rank Badge */}
      <span
        className={`inline-flex items-center rounded-full font-medium ${getRankColor(rank)} ${sizes.rank}`}
        aria-label={`Rank ${rank}`}
      >
        {rank}
      </span>

      {/* Genre Flairs */}
      {displayGenres.map((genre, index) => (
        <span
          key={genre}
          className={`inline-flex items-center rounded-full font-medium ${getGenreColor(index)} ${sizes.genre}`}
          aria-label={`Flair ${genre}`}
        >
          {genre}
        </span>
      ))}
    </div>
  );
};

export default UserFlairs;
