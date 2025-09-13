import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type: 'cover' | 'list' | 'text' | 'card';
  className?: string;
  lines?: number;
}

const SkeletonLoader = ({ type, className = '', lines = 1 }: SkeletonLoaderProps) => {
  const baseClasses = 'bg-manga-surface rounded animate-pulse';
  
  const variants = {
    cover: 'w-full h-full',
    list: 'w-full h-32',
    text: 'h-4 w-full',
    card: 'w-full h-48'
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
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variants[type]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};

export default SkeletonLoader;
