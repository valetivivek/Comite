# AGENTS.md — Project Instructions (Codex / General Agents)

## Overview

- This repo is a **Vite + React 18 + TypeScript** single-page app. It is **not** a Next.js app.
- Frontend entry: `src/main.tsx`. Route map: `src/App.tsx`.
- Only server-side code: `api/sign-upload.ts` (Vercel serverless function for signed Cloudflare R2 uploads).
- Prefer code and config over `README.md` when they disagree.
- Respect proprietary license headers; keep `COPYRIGHT`, `LICENSE.txt`, and `NOTICE` intact.

## Documentation

- Canonical working memory lives in `docs/`.
- At session start, read `docs/README.md` first, then the relevant file for the task:
  - `docs/architecture.md` — system shape, boundaries, data flow
  - `docs/current-state.md` — what is implemented, what is mocked, known gaps
  - `docs/decisions.md` — rationale behind non-obvious choices
  - `docs/development.md` — commands, env vars, deployment, validation
- Before finishing any material change, **update the affected `docs/*.md` files**.
- Treat documentation as requiring refresh when either of these is true:
  - the change affects architecture, routes, providers, services, APIs, environment variables, build/deploy config, storage model, theming foundations, or user-visible behavior
  - the session changes `3+` implementation/config files, even if the drift seems small
- For small focused edits under that threshold, update docs only if the written behavior or structure would become inaccurate.
- `README.md` and `IMPLEMENTATION.md` are secondary/historical unless explicitly re-synced.

## Commands

```sh
npm install          # Install dependencies
npm run dev          # Vite dev server on port 3000 (host: true)
npm run build        # tsc && vite build — the only verified typecheck path
npm run lint         # ESLint
npm run preview      # Preview production build
```

> **No test command exists.** Do not invent one or claim test coverage.

## Architecture

| Path | Purpose |
|------|---------|
| `src/main.tsx` | Mounts the app, imports global styles |
| `src/App.tsx` | ThemeProvider + AuthProvider, notification polling, all routes |
| `src/pages/` | Route-level screens (`admin/`, `legal/` subtrees) |
| `src/components/` | Shared UI, route guards, layout, reader/listing components |
| `src/contexts/ThemeContext.tsx` | Dark/light toggle via `localStorage` + CSS variables |
| `src/contexts/AuthContext.tsx` | Mock auth; roles from `comite-role-map` + hardcoded owner email |
| `src/services/dataService.ts` | Client data layer; seeds demo data, persists to `localStorage` |
| `src/services/readingStatsService.ts` | Derives reading stats from stored client data |
| `api/sign-upload.ts` | Validates role/secret, rate-limits by IP, returns R2 signed URLs |
| `public/` | Static assets (`manifest.json`, `robots.txt`, `sitemap.xml`) |

## Conventions

- **TypeScript strict mode** — `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- Routing via `react-router-dom`; add new pages through `src/App.tsx`.
- Use the `manga-*` Tailwind tokens from `tailwind.config.js` and CSS-variable component classes in `src/index.css`. Avoid raw color literals.
- **Client-state-first**: auth, bookmarks, ratings, notifications, and reading history are `localStorage`-backed.
- Upload path spans client and server: `UploadAdminPage.tsx` sends role header + `VITE_ADMIN_SHARED_SECRET` → `api/sign-upload.ts` verifies `ADMIN_SHARED_SECRET`.
- `.next/`, `next-env.d.ts`, and the `next` TS plugin entry are **legacy leftovers**. Canonical toolchain is Vite + Vercel.

## Environment Variables

Frontend-only work needs no secrets (demo data is seeded in `dataService.ts`).

Server env vars for `api/sign-upload.ts`:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `PUBLIC_CDN_BASE_URL`
- `ADMIN_SHARED_SECRET`
- `CORS_ALLOW_ORIGIN`

Build-time: `VITE_ADMIN_SHARED_SECRET` (used by `UploadAdminPage.tsx`).

Deployment config in `vercel.json`: build → `npm run build`, output → `dist`, `/api/*` → serverless, everything else → `index.html` SPA rewrite.

## Validation Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds (TypeScript + production bundle)
- [ ] If upload flow was touched, both client call site and `api/sign-upload.ts` are consistent
- [ ] Affected `docs/*.md` files are updated
