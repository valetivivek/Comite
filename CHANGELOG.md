# Changelog

## [1.0.0] - 2025-01-27

### Visual Improvements
- **Navbar**: Enhanced logo contrast with gradient text and drop shadow
- **Logo**: Added tagline "Read thousands of manga, manhwa & comics online"
- **Ratings**: Implemented white stars with dark outline and chip background for better visibility
- **Chapter Links**: Improved font size (min 14px), tighter hierarchy, and clear hover states
- **Bookmarks**: Increased contrast and added active color states

### UX Enhancements
- **Primary Navigation**: Added Browse, Categories, Popular, New Releases navigation links
- **Card Interactions**: Consistent hover and press feedback on all clickable areas
- **Chapter List**: Added chapter titles, reading status indicators, and "Continue Reading" buttons
- **Touch Targets**: Ensured minimum 44x44px touch targets for all interactive elements

### Content Updates
- **Hero Section**: Added 1-2 line USP about free reading, quality, and frequent updates
- **Card Content**: Added 2-line plot summaries and prominent author names with linking
- **Genre Tags**: Implemented colored badges with consistent spacing and accessible contrast
- **Search Placeholder**: Updated to "Search manga, manhwa, or authors..."

### Technical Improvements
- **Accessibility**: Added proper focus rings, ARIA labels, and keyboard navigation
- **Loading States**: Implemented skeleton loaders for cover images and content
- **Responsive Design**: Mobile-first approach with proper breakpoints and no horizontal scroll
- **Performance**: Optimized animations with prefers-reduced-motion support

### New Components
- **SkeletonLoader**: Reusable component for loading states with multiple variants
- **Enhanced ListItem**: Improved card layout with better content hierarchy
- **Enhanced ChapterList**: Better UX with reading status and continue reading functionality

### CSS Utilities
- **Line Clamp**: Added utilities for text truncation (1, 2, 3 lines)
- **Touch Targets**: Added utility class for minimum touch target sizes
- **Safe Area**: Added support for mobile device safe areas
- **Focus States**: Enhanced focus indicators for better accessibility

### Accessibility Compliance
- **WCAG AA**: Ensured proper contrast ratios on all text and controls
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Added proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus rings on all interactive elements

### Performance Optimizations
- **Lighthouse Ready**: Optimized for Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90
- **CLS Prevention**: Implemented proper loading states to prevent Cumulative Layout Shift
- **Mobile Optimization**: No horizontal scroll at 320px width
- **Reduced Motion**: Respects user's motion preferences
