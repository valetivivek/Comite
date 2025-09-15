import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { JsonLd, generateBreadcrumbSchema } from './JsonLd';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  const location = useLocation();
  
  // Generate breadcrumbs from current location if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Customize labels based on the route
      let label = segment;
      
      if (segment === 'series' && pathSegments[index + 1]) {
        // For series pages, we'll need to get the series title
        // For now, we'll use a generic label
        label = 'Series';
      } else if (segment === 'chapter' && pathSegments[index + 1]) {
        label = 'Chapter';
      } else if (segment === 'bookmarks') {
        label = 'Bookmarks';
      } else if (segment === 'popular') {
        label = 'Popular';
      } else if (segment === 'profile') {
        label = 'Profile';
      } else if (segment === 'history') {
        label = 'Reading History';
      } else if (segment === 'legal') {
        label = 'Legal';
      } else if (segment === 'login') {
        label = 'Sign In';
      } else if (segment === 'signup') {
        label = 'Sign Up';
      } else {
        // Capitalize first letter
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();
  
  // Generate JSON-LD schema
  const jsonLdSchema = generateBreadcrumbSchema(
    breadcrumbItems.map(item => ({
      name: item.label,
      url: `${window.location.origin}${item.href}`
    }))
  );

  return (
    <>
      <JsonLd data={jsonLdSchema} />
      <nav 
        className={`flex items-center space-x-1 text-sm ${className}`}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-1">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="h-4 w-4 text-manga-muted mx-1" />
              )}
              
              {index === 0 ? (
                <Link
                  to={item.href}
                  className="flex items-center text-manga-muted hover:text-manga-text transition-colors"
                  aria-label="Home"
                >
                  <HomeIcon className="h-4 w-4" />
                </Link>
              ) : index === breadcrumbItems.length - 1 ? (
                // Last item is not clickable
                <span className="text-manga-text font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-manga-muted hover:text-manga-text transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
