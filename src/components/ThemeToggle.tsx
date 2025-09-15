import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle = ({ className = '', size = 'md' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`rounded-lg bg-manga-surface hover:bg-manga-border border border-manga-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-bg ${buttonSizeClasses[size]} ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 0 : 180,
          scale: theme === 'dark' ? 1 : 1.1
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        {theme === 'dark' ? (
          <MoonIcon className={`${sizeClasses[size]} text-manga-text`} />
        ) : (
          <SunIcon className={`${sizeClasses[size]} text-manga-warning`} />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
