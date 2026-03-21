import { useEffect, useState } from 'react';
import { readingStatsService } from '../services/readingStatsService';
import { dataService } from '../services/dataService';

interface UserFlairsProps {
  userId: string;
  variant?: 'dashboard' | 'comment';
  className?: string;
}

const UserFlairs = ({ userId, variant = 'dashboard', className = '' }: UserFlairsProps) => {
  const [flairs, setFlairs] = useState<{ rank: string; genres: string[] } | null>(null);

  useEffect(() => {
    const loadFlairs = async () => {
      try {
        // Get user's manual flair selection
        const manualFlairs = await dataService.getUserFlairPreferences(userId);
        
        // Get flairs with manual selection if available
        const userFlairs = readingStatsService.getUserFlairs(userId, manualFlairs.length > 0 ? manualFlairs : undefined);
        setFlairs(userFlairs);
      } catch (error) {
        console.error('Error loading flairs:', error);
        // Fallback to auto flairs
        const userFlairs = readingStatsService.getUserFlairs(userId);
        setFlairs(userFlairs);
      }
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
      case 'Archivist': return 'theme-chip theme-chip-info';
      case 'Binger': return 'theme-chip theme-chip-accent';
      case 'Enthusiast': return 'theme-chip theme-chip-success';
      case 'Reader': return 'theme-chip theme-chip-warning';
      default: return 'theme-chip theme-chip-neutral';
    }
  };

  const getGenreColor = (index: number): string => {
    const colors = [
      'theme-chip theme-chip-accent-soft',
      'theme-chip theme-chip-info',
      'theme-chip theme-chip-warning'
    ];
    return colors[index] || 'theme-chip theme-chip-neutral';
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
