# Development

## Verified Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
  - Uses Vite
  - Runs on port `3000`
  - Binds to host via `vite.config.ts`
- Build for production: `npm run build`
  - Runs `tsc && vite build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`

## Environment Variables

These are required for the upload API path in `api/sign-upload.ts`:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `PUBLIC_CDN_BASE_URL`
- `ADMIN_SHARED_SECRET`
- `CORS_ALLOW_ORIGIN`

This is also required on the client build side for the admin upload page:

- `VITE_ADMIN_SHARED_SECRET`

The upload endpoint only accepts JPG, PNG, and WebP files up to 10 MB, validates the object key shape server-side, and signs an R2-compatible `PUT` request without S3 ACL headers.

## Deployment Model

- Platform: Vercel
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing: non-API routes rewrite to `index.html`
- API routing: `/api/*` maps to Vercel serverless functions
- Asset storage: Cloudflare R2
- Asset delivery: public CDN base URL configured through `PUBLIC_CDN_BASE_URL`

## Validation Expectations

- Run `npm run lint` after material code changes.
- Run `npm run build` when TypeScript, routing, configuration, or deploy-sensitive behavior changes.
- If upload behavior changes, validate both:
  - `src/pages/admin/UploadAdminPage.tsx`
  - `api/sign-upload.ts`

## Practical Editing Rules

- Do not assume Next.js. This repo is currently Vite-driven.
- Do not invent a test command. No test script exists today.
- Preserve license and legal files.
- Treat `README.md` as public-facing and `docs/` as the canonical internal knowledge base.
- When you change architecture, behavior, commands, or project assumptions, update `docs/` in the same task.
