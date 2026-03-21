# Project Instructions

## Overview

- Treat this repo as a Vite + React 18 + TypeScript single-page app, not a Next.js app.
- Use `src/main.tsx` as the frontend entry point and `src/App.tsx` as the route map.
- Use `api/sign-upload.ts` as the only server-side code path in this repo. It is a Vercel serverless function for signed Cloudflare R2 uploads.
- Prefer code and config over `README.md` when they disagree. The README still carries some older naming and design notes.
- Respect the proprietary license headers and keep copyright/license files intact.

## Documentation

- Treat `docs/` as the canonical working memory for this repo.
- At session start, read `docs/README.md` first, then read the relevant files for the task:
  - `docs/architecture.md` for system shape, boundaries, and data flow
  - `docs/current-state.md` for what is implemented, what is mocked, and known gaps
  - `docs/decisions.md` for the why behind non-obvious choices
  - `docs/development.md` for commands, env vars, deployment, and validation
- Before finishing any material change, update the affected `docs/*.md` files so future Codex sessions can understand what changed and why.
- Keep `AGENTS.md` short and operational. Put durable project knowledge in `docs/`.
- Treat `README.md` and `IMPLEMENTATION.md` as secondary or historical unless they are explicitly brought back into sync.

## Commands

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
  Notes: runs Vite on port `3000` with `host: true` from `vite.config.ts`.
- Build for production and run TypeScript validation: `npm run build`
  Notes: this is the only verified typecheck path because the script is `tsc && vite build`.
- Run lint: `npm run lint`
- Preview the production build: `npm run preview`
- Do not invent a test command. No automated test script or test directory exists in this repo.

## Architecture

- `src/main.tsx`: mounts the app and imports global styles.
- `src/App.tsx`: wraps the app in `ThemeProvider` and `AuthProvider`, starts notification polling, and defines all routes.
- `src/pages/`: route-level screens.
  Important subtrees:
  - `src/pages/admin/` for admin-only screens
  - `src/pages/legal/` for license, terms, privacy, and DMCA pages
- `src/components/`: shared UI, route guards, layout, and reader/listing components.
- `src/contexts/ThemeContext.tsx`: toggles dark/light theme by writing `theme` to `localStorage` and applying CSS variables on the root element.
- `src/contexts/AuthContext.tsx`: mock auth state backed by `localStorage`; roles come from `comite-role-map` and a hardcoded owner email.
- `src/services/dataService.ts`: primary client-side data layer. It seeds demo series data when storage is empty and persists series, bookmarks, ratings, notifications, and reading history in `localStorage`.
- `src/services/readingStatsService.ts`: derives reading stats from stored client data.
- `api/sign-upload.ts`: validates role/secret headers, rate-limits by IP, and returns short-lived R2 signed upload URLs.
- `public/`: static assets such as `manifest.json`, `robots.txt`, and `sitemap.xml`.

## Conventions

- Keep TypeScript strict. `tsconfig.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.
- Preserve the current routing model with `react-router-dom`; add new pages through `src/App.tsx`.
- Prefer the existing theme token system over raw color literals.
  Use the `manga-*` Tailwind tokens from `tailwind.config.js` and the CSS variable-backed component classes in `src/index.css`.
- Treat the app as client-state-first unless you are intentionally introducing a backend.
  Auth, bookmarks, ratings, notifications, and reading history are currently localStorage-backed.
- When editing admin flows, remember the upload path spans both client and server:
  `src/pages/admin/UploadAdminPage.tsx` sends the role header and `VITE_ADMIN_SHARED_SECRET`, and `api/sign-upload.ts` verifies `ADMIN_SHARED_SECRET`.
- Treat `.next/`, `next-env.d.ts`, and the `next` TypeScript plugin entry as legacy leftovers unless the repo is being deliberately migrated. The canonical toolchain is still Vite plus Vercel.

## Env & Setup

- Frontend-only work can run without secrets because demo data is seeded in `dataService.ts`.
- `api/sign-upload.ts` requires these server env vars:
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET`
  - `PUBLIC_CDN_BASE_URL`
  - `ADMIN_SHARED_SECRET`
  - `CORS_ALLOW_ORIGIN`
- `src/pages/admin/UploadAdminPage.tsx` also expects `VITE_ADMIN_SHARED_SECRET` at build time.
- `vercel.json` is the deployment source of truth:
  - build command: `npm run build`
  - output directory: `dist`
  - `/api/*` stays on the serverless side
  - all other routes rewrite to `index.html` for SPA routing

## Validation

- Before finishing material changes, run `npm run lint`.
- Run `npm run build` for TypeScript and production build validation.
- If you touch the upload flow, verify both the client call site and `api/sign-upload.ts` together; mismatched secrets or headers will break uploads.
- No automated tests are present, so do not claim test coverage.
