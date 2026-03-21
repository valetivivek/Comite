# Decisions

This file records durable engineering decisions for the repo. Keep entries short, factual, and code-backed.

## 2026-03-20

### Canonical Web Toolchain Is Vite, Not Next.js

- Decision: Treat Vite as the canonical frontend build/runtime toolchain.
- Why: `package.json`, `vite.config.ts`, and `vercel.json` all point to Vite, while the Next-related files are residual.
- Consequence: Do not design work around Next.js conventions unless the repo is being explicitly migrated.

### Client State Remains Browser-Local Until A Real Backend Is Introduced

- Decision: Continue using `localStorage` plus seeded demo content as the current application state model.
- Why: `dataService.ts`, `AuthContext.tsx`, and related pages are built around local storage and mock data.
- Consequence: New work should either stay consistent with this model or clearly introduce a backend boundary instead of partially assuming one exists.

### Theme Tokens Are The Styling Source Of Truth

- Decision: Prefer the CSS variable plus Tailwind token system already defined in `tailwind.config.js` and `src/index.css`.
- Why: The app already centralizes colors and component classes through `manga-*` tokens and theme variables.
- Consequence: New UI should reuse those tokens instead of hardcoding one-off colors.

### Theme Helpers Should Cover Badges, Alerts, Backdrops, And Loading States

- Decision: Use shared theme helpers in `src/index.css` for tinted chips, destructive surfaces, modal backdrops, and skeleton shimmer instead of raw black, white, gray, and red utility colors.
- Why: Several secondary surfaces still looked inconsistent across light and dark mode even after the primary palette migration.
- Consequence: When editing UI affordances such as status pills, alerts, overlays, or skeletons, extend or reuse the helper classes before introducing one-off utility colors.

### Admin Uploads Use Signed Direct-To-R2 Uploads

- Decision: Keep admin/editor asset uploads on the current split flow: signed URL generation in Vercel, binary upload direct to R2, and public delivery through `PUBLIC_CDN_BASE_URL`.
- Why: `api/sign-upload.ts` and `src/pages/admin/UploadAdminPage.tsx` are already built around this model.
- Consequence: Changes to upload behavior must keep client headers, server validation, and environment variables aligned.

### R2 Upload Signing Must Avoid ACL Headers

- Decision: Sign direct-to-R2 uploads without `ACL` or `x-amz-acl`.
- Why: Cloudflare R2's S3 compatibility layer does not implement ACL support for `PutObject`, so AWS-style `public-read` uploads fail even when the rest of the request is valid.
- Consequence: Public access must come from bucket or CDN configuration, while the client upload request should only send headers R2 actually supports.

### `docs/` Is The Canonical Repository Memory

- Decision: Store durable project knowledge under `docs/` and make Codex read and update it on material changes.
- Why: The repo needed a single trustworthy place to understand architecture, current status, commands, and rationale without re-reading the whole codebase.
- Consequence: Future changes should update `docs/architecture.md`, `docs/current-state.md`, `docs/decisions.md`, and `docs/development.md` as needed.

### Design Direction Is Dark-Led, Calm, Premium, And Playful

- Decision: Treat ComiTe's design direction as dark-led, calm, premium, and playful, while keeping both dark and light themes as first-class experiences.
- Why: The project owner defined the target audience as anime viewers using the app in a personal-stage product, asked to keep the current theme direction, rejected generic comic-reader aesthetics, and emphasized mobile-first power-user usability.
- Consequence: Future UI work should preserve the existing token system, avoid AI-slop and portal-style clutter, and optimize for efficient reading-first interactions on mobile and desktop.

### Shell Branding Should Stay Expressive, Not Flattened

- Decision: Keep the stronger gradient ComiTe wordmark and use snippet-inspired pill navigation, floating controls, and interactive CTA treatments on shell and landing surfaces.
- Why: The flatter replacement logo was explicitly rejected, and the preferred direction is the user's own `ui-design-snippets` language rather than generic stripped-down chrome.
- Consequence: Do not regress the header back to a plain dot-plus-wordmark treatment or plain default buttons when editing the shell.

### Imported UI Snippets Must Be Refit To Comite's Stack And Tokens

- Decision: When adapting external UI snippets, rewrite them to use Comite's existing theme tokens, Heroicons, React Router, and local utility classes instead of copying Next.js, shadcn/ui, Lucide, or raw palette assumptions directly.
- Why: The user wants to reuse strong interaction ideas, but the repo's stack and visual language are already defined and should not drift into mismatched dependencies or styles.
- Consequence: Snippet-inspired elements such as hero pills, footers, password confirmation affordances, avatars, and destructive actions should be normalized into reusable Comite components before being used in pages.
