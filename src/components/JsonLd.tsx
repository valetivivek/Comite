
import { Series } from '../types';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Generate JSON-LD schema for a comic series
export function generateSeriesSchema(series: Series) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": series.title,
    "author": {
      "@type": "Person",
      "name": series.author
    },
    "genre": series.genre,
    "description": series.description,
    "image": series.coverImage,
    "url": `${window.location.origin}/series/${series.id}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": series.rating.toString(),
      "ratingCount": Math.floor(Math.random() * 1000) + 500 // Mock rating count
    },
    "bookFormat": "ComicBook",
    "numberOfPages": series.totalChapters,
    "datePublished": series.lastUpdated,
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "publisher": {
      "@type": "Organization",
      "name": "Comite"
    }
  };
}

// Generate JSON-LD schema for the website
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Comite",
    "description": "Read thousands of manga, manhwa & comics online. Latest chapters updated daily.",
    "url": "https://comitecomic.vercel.app/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://comitecomic.vercel.app/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Comite",
      "logo": {
        "@type": "ImageObject",
        "url": "https://comitecomic.vercel.app/logo.png"
      }
    }
  };
}

// Generate JSON-LD schema for breadcrumb navigation
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
