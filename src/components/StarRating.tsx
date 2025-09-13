import { useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface StarRatingProps {
  rating: number;
  userRating?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showDual?: boolean;
}

const StarRating = ({ 
  rating, 
  userRating,
  onRatingChange, 
  interactive = false, 
  size = 'md',
  showValue = false,
  showDual = false
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (newRating: number) => {
    if (interactive) {
      setHoverRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || (interactive && userRating !== undefined ? userRating : (rating || 0));

  if (showDual && userRating !== undefined) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        {/* Global Average Rating */}
        <div className="flex items-center gap-1">
          <span className="text-xs sm:text-sm text-manga-muted">Average:</span>
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => {
              return (
                <StarSolidIcon 
                  key={i}
                  className={`${sizeClasses[size]} text-yellow-400`}
                />
              );
            })}
          </div>
          <span className="text-xs sm:text-sm text-manga-muted ml-1">
            {rating > 0 ? rating.toFixed(1) : 'Not rated'}
          </span>
        </div>

        {/* User Rating */}
        <div className="flex items-center gap-1">
          <span className="text-xs sm:text-sm text-manga-muted">Your rating:</span>
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => {
              const starValue = i + 1;
              const isFilled = starValue <= displayRating;
              
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => handleClick(starValue)}
                  onMouseEnter={() => handleMouseEnter(starValue)}
                  onMouseLeave={handleMouseLeave}
                  disabled={!interactive}
                  className={`${sizeClasses[size]} ${
                    interactive 
                      ? 'cursor-pointer hover:scale-110 transition-transform' 
                      : 'cursor-default'
                  }`}
                  whileHover={interactive ? { scale: 1.1 } : {}}
                  whileTap={interactive ? { scale: 0.95 } : {}}
                >
                  {isFilled ? (
                    <StarSolidIcon className={`${sizeClasses[size]} text-neon-400`} />
                  ) : (
                    <StarIcon className={`${sizeClasses[size]} text-manga-muted`} />
                  )}
                </motion.button>
              );
            })}
          </div>
          {showValue && (
            <span className="text-xs sm:text-sm text-manga-muted ml-1">
              {userRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= displayRating;
          
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`${sizeClasses[size]} ${
                interactive 
                  ? 'cursor-pointer hover:scale-110 transition-transform' 
                  : 'cursor-default'
              }`}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.95 } : {}}
            >
              {isFilled ? (
                <StarSolidIcon className={`${sizeClasses[size]} text-yellow-400`} />
              ) : (
                <StarIcon className={`${sizeClasses[size]} text-manga-muted`} />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-manga-muted ml-1">
          {rating > 0 ? rating.toFixed(1) : 'Not rated'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
