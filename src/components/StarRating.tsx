import { useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  interactive = false, 
  size = 'md',
  showValue = false 
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

  const displayRating = hoverRating || rating;

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
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
