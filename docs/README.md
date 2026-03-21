# Project Docs

This directory is the canonical project memory for Comite.

Use it for the information that a future Codex session or human contributor should be able to trust without re-reading the whole codebase.

Automatic update model:

- Codex should read this directory at the start of work.
- Codex should update the affected files here in the same task whenever architecture, behavior, commands, or assumptions change.
- This is the repo's automatic documentation contract unless a different workflow is introduced later.

## Read Order

1. `docs/README.md`
2. `docs/architecture.md`
3. `docs/current-state.md`
4. `docs/decisions.md`
5. `docs/development.md`

## Canonical Files

| File | Purpose | Update When |
|------|---------|-------------|
| `docs/architecture.md` | System design, module boundaries, route structure, data flow, storage model | Providers, routes, services, API boundaries, or major folder responsibilities change |
| `docs/current-state.md` | What is implemented today, what is mocked, what is incomplete, and known gaps | Feature behavior, product scope, mock/real status, or project maturity changes |
| `docs/decisions.md` | Durable engineering decisions and their rationale | A non-obvious project decision is made, reversed, or clarified |
| `docs/development.md` | Verified commands, env vars, deployment model, and validation expectations | Scripts, environment requirements, deployment, or verification workflow changes |

## Update Contract

- Update these docs in the same change that modifies the underlying behavior.
- Prefer correcting docs immediately over leaving TODOs about documentation drift.
- Keep docs factual and code-backed. Do not describe aspirational behavior as if it already exists.
- When code and docs disagree, fix the docs or the code before closing the task.
- Put new durable project context in `docs/`, not in `AGENTS.md`.

## Scope Rules

- `AGENTS.md` tells Codex how to operate in this repo.
- `docs/` explains what the repo is, how it works, and why it is shaped this way.
- `README.md` is the public/product-facing overview and may lag behind implementation.
- `IMPLEMENTATION.md` is a historical implementation snapshot and should not be treated as the primary source of truth.

## Current Structure

- `docs/architecture.md`: canonical architecture map
- `docs/current-state.md`: feature and maturity snapshot
- `docs/decisions.md`: decision log
- `docs/development.md`: setup, commands, env, deployment, validation
