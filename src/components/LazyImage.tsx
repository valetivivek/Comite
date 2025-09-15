import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { convertToWebP } from '../utils/imageUtils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pgo8L3N2Zz4K',
  onLoad,
  onError
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Convert to WebP when component mounts
    convertToWebP(src).then(setOptimizedSrc);
  }, [src]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {isInView && (
        <>
          {/* Placeholder */}
          <motion.img
            src={placeholder}
            alt={alt || 'Image placeholder'}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: isLoaded ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Actual Image */}
          <motion.img
            src={optimizedSrc}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-full object-cover"
            onLoad={handleLoad}
            onError={handleError}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
        </>
      )}
      
      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-manga-surface flex items-center justify-center">
          <span className="text-manga-muted text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
