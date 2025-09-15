# Comite - Comics Reimagined

A mobile-first manga and manhua reading web application built with React, TypeScript, and Tailwind CSS. Features a teal-centric design with subtle micro-animations and smooth, accessible UI/UX.

## 🚀 Live Demo

**[View Live Demo](https://comitecomic.vercel.app/)**

Experience the full application with all features including responsive design, interactive components, and smooth animations.

## Features

### 🏠 Home Page
- **Auto-sliding carousel** with top manhuas (1-second intervals, pauses on hover)
- **List/Grid toggle** for browsing all series with animated transitions
- **Advanced search and filtering** with debounced input
- **Series cards** showing cover, title, latest chapter, and read status

### 📖 Series Page
- **Detailed series information** with cover, title, author, tags, and ratings
- **Expandable description** with "read more/less" functionality
- **Chapter list** with sorting and filtering options
- **Bookmark toggle** with persistent storage
- **Quick chapter navigation** with dropdown

### 📚 Reader Page
- **Vertical scrolling panels** with lazy loading
- **Fixed minimal toolbar** that auto-hides
- **Chapter navigation** with previous/next buttons
- **Progress indicators** for chapter and series completion
- **Chapter dropdown** for quick jumping
- **Auto-mark as read** functionality

### 🔖 Bookmarks & Notifications
- **Bookmarks page** with saved series and latest update badges
- **In-app notifications** for new chapters (client-side polling)
- **Continue reading** buttons for quick access
- **Read progress tracking** across all bookmarked series

## Tech Stack

- **Frontend**: React 18 with Vite, TypeScript, Tailwind CSS
- **Animations**: Framer Motion for micro-animations and transitions
- **Routing**: React Router for navigation
- **Icons**: Heroicons for consistent iconography
- **State Management**: Lightweight local state with localStorage persistence
- **Data Layer**: Abstracted service layer for easy API integration

## Design System

### Color Palette
- **Primary**: Teal (teal-500 to teal-700)
- **Accents**: Cool grays and complementary cool hues
- **Accessibility**: WCAG compliant contrast ratios

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear heading and body text scales
- **Readability**: Optimized line heights and spacing

### Motion Design
- **Micro-animations**: Subtle jitter effects on hover/focus
- **Transitions**: Smooth slide and fade animations
- **Accessibility**: Respects `prefers-reduced-motion` setting
- **Performance**: Hardware-accelerated transforms

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd manga-reader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/         
│   ├── Carousel.tsx   
│   ├── Layout.tsx      
│   ├── SeriesCard.tsx  
│   └── SearchFiltersModal.tsx
├── pages/             
│   ├── HomePage.tsx    
│   ├── SeriesPage.tsx  
│   ├── ReaderPage.tsx  
│   └── BookmarksPage.tsx
├── services/          
│   ├── dataService.ts  
│   └── notificationService.ts
├── types/              
│   └── index.ts
├── App.tsx           
├── main.tsx          
└── index.css          
```

## Key Features Implementation

### Mobile-First Design
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Touch-friendly interactions and gestures
- Optimized for mobile viewport and performance

### Data Persistence
- **localStorage** for bookmarks, read states, and preferences
- **Abstracted service layer** for easy API migration
- **Type-safe** data operations with TypeScript

### Performance Optimizations
- **Lazy loading** for images and components
- **Debounced search** to reduce API calls
- **Virtualized lists** for large chapter collections
- **Hardware-accelerated** animations

### Accessibility
- **Keyboard navigation** support
- **Screen reader** friendly markup
- **Focus management** and visual indicators
- **Reduced motion** preferences respected

## Customization

### Adding New Features
1. Define types in `src/types/index.ts`
2. Extend data service in `src/services/dataService.ts`
3. Create components in `src/components/`
4. Add routes in `src/App.tsx`

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Use Tailwind utility classes for component styling

### Data Source
- Replace mock data in `dataService.ts` with real API calls
- Update service methods to handle async operations
- Add error handling and loading states

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, CSS Grid, Flexbox, CSS Custom Properties

## License

ComiTe is licensed under the ComiTe Proprietary License. No reuse of code, templates, or UI without written permission. See LICENSE.txt and /legal pages.

**Important**: This software, including its UI, templates, and design, is proprietary and protected by copyright. You may not reuse, copy, or derive from the UI layout, component structure, or visual template without written permission from Vishnu Vivek Valeti.

For licensing inquiries or commercial use, please contact: vivekvaleti7053@gmail.com

- [View Full License](/legal/license)
- [Terms of Use](/legal/terms)
- [Privacy Policy](/legal/privacy)
- [DMCA Notice](/legal/dmca)

## Cloudflare + R2 + Vercel ($0 tiers)

- DNS on Cloudflare Free. App remains hosted on Vercel Hobby. Images are served from Cloudflare R2 via `cdn.comite.xyz`.
- Signed uploads: admins/editors request a short-lived signed URL from `/api/sign-upload` and upload directly to R2. No server proxy for image reads.

### Environment Variables (Vercel Project Settings)

Set these in Vercel → Project → Settings → Environment Variables:

- R2_ACCOUNT_ID: Cloudflare account ID
- R2_ACCESS_KEY_ID: R2 access key ID (scoped)
- R2_SECRET_ACCESS_KEY: R2 secret
- R2_BUCKET: R2 bucket name (public)
- PUBLIC_CDN_BASE_URL: https://cdn.comite.xyz
- ADMIN_SHARED_SECRET: short random string used by admin/editor clients
- CORS_ALLOW_ORIGIN: https://comite.vercel.app, https://www.comite.xyz (comma-separated)
- VITE_ADMIN_SHARED_SECRET: same value as ADMIN_SHARED_SECRET (Client build-time)

### Upload Flow (Admins/Editors)

1) Admin goes to Admin → Upload Assets.
2) Select files; client requests a signed URL from `/api/sign-upload` with role header and secret.
3) Client PUTs file to signed URL; UI shows resulting `PUBLIC_CDN_BASE_URL/{key}`.

### Free-tier notes

- R2 public objects are cached aggressively with `Cache-Control: public, max-age=31536000, immutable`.
- Do not cache HTML on Cloudflare. Keep DNS-only for app host. Proxy/cdn allowed for `cdn.comite.xyz`.