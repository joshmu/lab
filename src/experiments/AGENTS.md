# Authoring an Experiment

This file is for whoever is writing a new experiment — usually an AI agent. Read this first; it removes 80% of the trial-and-error.

## Start

```bash
pnpm experiment:new <slug>
```

That's the entry point. It scaffolds `src/experiments/<slug>/` with a valid `meta.ts` (status `"draft"`) and a working `index.tsx`. Don't hand-roll the folder; the scaffolder fills every required field correctly.

## What you can change

- Anything inside `src/experiments/<your-slug>/`.
- Nothing outside it without explicit permission.

## Rules

- **Default-export the component from `index.tsx`.** The router relies on it.
- **Add `"use client"`** at the top of `index.tsx` if your experiment uses any React hooks, browser APIs, or interactivity. The scaffolder does this for you.
- **Fill every meta field.** `slug`, `title`, `description`, `tags`, `createdAt`, `status` are all required. The slug must match the folder name. The validator fails the build if any field is wrong.
- **Don't commit `src/experiments/registry.ts`.** It's a gitignored build artefact regenerated automatically.
- **Don't add new dependencies** without explicit permission. Use what's already in `package.json` (Next, React, Tailwind, lucide-react, shadcn/ui components in `src/components/ui/`).
- **Shared helpers go in `src/experiments/_shared/`.** Don't reach into `src/lib/` for cross-experiment utilities. `src/lib/` is for sandbox infrastructure; promotion of an experiment helper into it is a deliberate human action.

## Verifying

Before claiming done:

```bash
pnpm experiment:check <slug>   # validates meta + presence of default export
pnpm dev                        # preview at /experiments/<slug>
```

Drafts (`status: "draft"`) are accessible at `/experiments/<slug>` in dev only — you don't need to flip status to preview.

When the experiment is ready, flip status to `"published"` and it appears on the homepage on the next dev/build cycle.

## Glossary

See [../../CONTEXT.md](../../CONTEXT.md) for the project's domain language (Experiment, Meta, Registry, Sandbox).
