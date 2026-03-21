# Architecture

## System Summary

Comite is a Vite-built React 18 single-page app with React Router on the client and one Vercel serverless function for signed Cloudflare R2 uploads.

The current product is client-state-heavy. Most user, reading, bookmark, rating, and notification behavior is simulated or persisted in `localStorage` rather than a remote backend.

## Runtime Topology

```text
Browser
  -> React SPA (`src/main.tsx`, `src/App.tsx`)
  -> localStorage-backed state and demo data
  -> optional admin upload request to `/api/sign-upload`

Vercel
  -> serves built SPA from `dist`
  -> runs `api/sign-upload.ts` as a serverless function

Cloudflare
  -> R2 stores uploaded assets
  -> `PUBLIC_CDN_BASE_URL` serves public image URLs
```

## Entry Points

- `src/main.tsx`: app bootstrap and global CSS import.
- `src/App.tsx`: wraps providers, starts notification polling, and declares the route tree.
- `api/sign-upload.ts`: signed upload endpoint for admin/editor image uploads.
- `vercel.json`: deployment behavior, SPA rewrites, and build output.

## Frontend Structure

### Providers

- `src/contexts/ThemeContext.tsx`
  - Applies `dark` or `light` theme to the root element.
  - Persists `theme` in `localStorage`.
- `src/contexts/AuthContext.tsx`
  - Maintains mock auth state in `localStorage`.
  - Uses `comite-role-map` plus a hardcoded owner email to derive roles.

### Routes

- Public routes
  - `/`
  - `/welcome`
  - `/dashboard`
  - `/series/:id`
  - `/series/:seriesId/chapter/:chapterId`
  - `/bookmarks`
  - `/login`
  - `/signup`
  - `/profile`
  - `/history`
  - `/popular`
  - `/new-releases`
  - `/legal/license`
  - `/legal/terms`
  - `/legal/privacy`
  - `/legal/dmca`
- Fallback route
  - `*` renders the not-found page
- Protected routes
  - `/notifications`
  - `/settings`
  - `/library`
- Admin routes
  - `/admin`
  - `/admin/series`
  - `/admin/chapters`
  - `/admin/users`
  - `/admin/tools`
  - `/admin/upload`

### Source Ownership

- `src/pages/`: route-level UI.
- `src/components/`: shared UI, layout, route guards, and reader/browse widgets.
- `src/services/`: client-side business logic and persistence.
- `src/types/`: shared application types.
- `src/utils/`: small utility functions.
- `public/`: static web assets.

## State And Data Model

### Core Types

- `Series`: metadata plus nested chapters.
- `Chapter`: chapter metadata, page image URLs, and read status.
- `Bookmark`: saved series plus last-read metadata.
- `ReadState`: per-chapter progress.
- `Notification`: in-app notification model.
- `UserRating`: per-user series rating.
- `ReadingHistory`: read events and progress snapshots.

### Storage Model

The current app stores most data in the browser.

Primary keys used in `localStorage`:

- `theme`
- `manga-reader-user`
- `comite-role-map`
- `manga-reader-series`
- `manga-reader-bookmarks`
- `manga-reader-read-states`
- `manga-reader-notifications`
- `manga-reader-user-ratings`
- `manga-reader-reading-history`
- `manga-reader-reading-stats`
- `manga-reader-user-history`
- `chapter-sort-order`
- `comment-author`

### Service Layer

- `src/services/dataService.ts`
  - Central client-side data source.
  - Seeds demo series data when storage is empty.
  - Owns series CRUD, bookmark behavior, ratings, notifications, and reading history persistence.
  - Reads flair eligibility from `readingStatsService` directly instead of using a no-op lazy import.
- `src/services/notificationService.ts`
  - Polls every 30 seconds by default.
  - Generates mock notifications for bookmarked series.
- `src/services/readingStatsService.ts`
  - Derives user reading stats from stored data.

## Theme System

- Tailwind colors in `tailwind.config.js` map to CSS variables such as `--bg`, `--card`, `--text`, and `--accent`.
- The theme layer also defines on-color foreground tokens and image-overlay tokens such as `--on-accent`, `--on-success`, `--overlay-strong`, and `--overlay-text` for hero banners and media-heavy UI.
- `index.html` loads the current web font pair, while `tailwind.config.js` exposes body and heading families to the app.
- `src/index.css` defines both theme variable sets and reusable component classes like `.btn-primary`, `.card`, `.input`, shared typography utilities such as `.eyebrow` and `.heading-*`, and theme helpers for tinted badges, alerts, modal backdrops, and skeleton shimmer states.
- Theme transitions are scoped to shared surfaces and controls instead of every DOM node to reduce unnecessary repaint work.
- New UI should prefer `manga-*` tokens and shared component classes over ad hoc color values.

## Upload Flow

1. Admin/editor selects files in `src/pages/admin/UploadAdminPage.tsx`.
2. Client sends a `POST` request to `/api/sign-upload` with:
   - `x-comite-role`
   - `x-comite-secret`
   - `contentType`
   - `objectKey`
   - `contentLength`
3. `api/sign-upload.ts` validates:
   - request method
   - per-IP rate limit
   - allowed role
   - shared secret
   - MIME type
   - object key format
   - file size
4. The API lazily resolves R2 env configuration, signs an R2-compatible `PutObject` request without ACL headers, and returns a short-lived upload URL plus the final public CDN URL.
5. The client uploads directly to R2 with `PUT` and only the file `Content-Type` header.

## Architectural Caveats

- The repo contains `.next/`, `next-env.d.ts`, and a `next` plugin entry in `tsconfig.json`, but the active build and deployment path is Vite plus Vercel.
- Auth is mock/local only. It is not backed by a real identity system.
- Notifications and analytics are partially simulated.
- The app behaves more like a rich prototype with production-style UI polish than a fully backend-connected production system.
