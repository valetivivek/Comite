/**
 * Utility functions for image optimization and format conversion
 */

/**
 * Check if the browser supports WebP format
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Convert a regular image URL to WebP format if supported
 * Falls back to original URL if WebP is not supported
 */
export const convertToWebP = async (originalUrl: string): Promise<string> => {
  try {
    const isWebPSupported = await supportsWebP();
    
    if (!isWebPSupported) {
      return originalUrl;
    }

    // If the URL already contains WebP format, return as is
    if (originalUrl.includes('.webp')) {
      return originalUrl;
    }

    // For demo purposes, we'll simulate WebP conversion
    // In a real application, you would:
    // 1. Check if WebP version exists on your CDN
    // 2. Generate WebP version on-the-fly
    // 3. Use image optimization services like Cloudinary, ImageKit, etc.
    
    // For now, we'll just return the original URL
    // You can implement actual WebP conversion logic here
    return originalUrl;
  } catch (error) {
    console.warn('Error converting to WebP:', error);
    return originalUrl;
  }
};

/**
 * Generate responsive image URLs for different screen sizes
 */
export const generateResponsiveImageUrls = (baseUrl: string): {
  small: string;
  medium: string;
  large: string;
  original: string;
} => {
  // In a real application, you would generate different sized versions
  // For now, we'll return the same URL for all sizes
  return {
    small: baseUrl,
    medium: baseUrl,
    large: baseUrl,
    original: baseUrl
  };
};

/**
 * Preload an image for better performance
 */
export const preloadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Get optimal image dimensions based on container size
 */
export const getOptimalImageDimensions = (
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number = 3/4
): { width: number; height: number } => {
  const containerAspectRatio = containerWidth / containerHeight;
  
  if (containerAspectRatio > aspectRatio) {
    // Container is wider than image aspect ratio
    return {
      width: containerHeight * aspectRatio,
      height: containerHeight
    };
  } else {
    // Container is taller than image aspect ratio
    return {
      width: containerWidth,
      height: containerWidth / aspectRatio
    };
  }
};
