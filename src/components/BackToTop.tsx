import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when page is scrolled down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-12 right-6 z-50 flex items-center justify-center pointer-events-auto"
        >
          <button
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-4 text-manga-muted hover:text-manga-text transition-colors"
            aria-label="Back to top"
          >
            <div className="h-6 w-6">
              <ArrowUpIcon className="w-full h-full group-hover:-translate-y-1 transition-transform" />
            </div>
            <span
              className="font-mono text-xs font-semibold tracking-[0.2em]"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
            >
              BACK TO TOP
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
