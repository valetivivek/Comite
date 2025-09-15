import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type: 'cover' | 'list' | 'text' | 'card' | 'series-card' | 'series-list';
  className?: string;
  lines?: number;
}

const SkeletonLoader = ({ type, className = '', lines = 1 }: SkeletonLoaderProps) => {
  const baseClasses = 'bg-manga-surface rounded relative overflow-hidden';
  
  const variants = {
    cover: 'w-full h-full',
    list: 'w-full h-32',
    text: 'h-4 w-full',
    card: 'w-full h-48',
    'series-card': 'w-full',
    'series-list': 'w-full'
  };

  if (type === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={`${baseClasses} ${variants.text} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'series-card') {
    return (
      <motion.div
        className={`card ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          {/* Cover Image Skeleton */}
          <div className="aspect-[3/4] overflow-hidden">
            <motion.div
              className={`${baseClasses} w-full h-full`}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-3 space-y-2">
          <div className={`${baseClasses} h-4 w-3/4`}>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div className={`${baseClasses} h-3 w-1/2`}>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div className={`${baseClasses} h-3 w-1/3`}>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  if (type === 'series-list') {
    return (
      <motion.div
        className={`card ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex p-4">
          {/* Cover Image Skeleton */}
          <div className="relative flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden mr-4">
            <motion.div
              className={`${baseClasses} w-full h-full`}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className={`${baseClasses} h-5 w-3/4`}>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div className={`${baseClasses} h-4 w-1/2`}>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div className={`${baseClasses} h-3 w-1/4`}>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variants[type]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
};

export default SkeletonLoader;
