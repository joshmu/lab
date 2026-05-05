# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Overview

A **sandbox** for agents to drop single-page ideas into. The sandbox handles registration, routing, validation, and discovery; the agent-author focuses on the idea. Architectural decisions are made from that audience's perspective first — see [ADR-0001](./docs/adr/0001-sandbox-for-agents.md).

Domain vocabulary lives in [`CONTEXT.md`](./CONTEXT.md). Use those terms (**Sandbox**, **Experiment**, **Meta**, **Registry**) when referring to project concepts.

**If you are authoring a new experiment, read [`src/experiments/AGENTS.md`](./src/experiments/AGENTS.md) first.** It's the entry point: scaffolder command, what you can change, the validation verb.

## Essential Commands

```bash
# Authoring an experiment
pnpm experiment:new <slug>    # Scaffold a new experiment (folder + meta.ts + index.tsx)
pnpm experiment:check <slug>  # Validate meta + default export

# Development
pnpm dev              # Start dev server (regenerates registry first)
pnpm build            # Generate registry + production build
pnpm generate:registry # Regenerate experiments registry (rarely needed manually)

# Quality checks
pnpm lint             # Run Oxlint
pnpm lint:fix         # Run Oxlint with auto-fix
pnpm format           # Format with oxfmt
pnpm format:check     # Check formatting
pnpm lint:md          # Lint markdown files
pnpm lint:knip        # Dead code detection (non-blocking)
pnpm check-types      # TypeScript type checking
pnpm test             # Run Vitest tests
pnpm test:coverage    # Run tests with coverage
pnpm audit            # Dependency vulnerability scan
pnpm validate         # Run all checks (lint + format + md + types + test + build)
```

## Commit Conventions

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) with a **required scope**:

```text
type(scope): description
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `style`

Examples: `feat(maze): add circular layout`, `fix(ci): correct timeout value`, `docs(readme): update commands`

Enforced by commitlint via commit-msg hook and CI.

## Validation Hooks

Pre-commit hooks run automatically via Husky + lint-staged:

- **pre-commit**: Oxlint + oxfmt on staged `.ts`/`.tsx` files, oxfmt on `.json`/`.css`, markdownlint on `.md`
- **commit-msg**: commitlint validates conventional commit format with required scope

## Creating a New Experiment

```bash
pnpm experiment:new <slug>      # scaffolds folder + meta.ts + index.tsx (status: "draft")
pnpm dev                        # preview at /experiments/<slug> (drafts work in dev)
pnpm experiment:check <slug>    # validates meta + default export before claiming done
```

Then flip `status` to `"published"` in `meta.ts` to surface the experiment on the homepage. Full agent-author rules live in [`src/experiments/AGENTS.md`](./src/experiments/AGENTS.md).

### Experiment Metadata Schema

```typescript
interface ExperimentMeta {
  slug: string; // URL slug (should match folder name)
  title: string; // Display title
  description: string; // Brief description
  tags: string[]; // Categorization tags
  createdAt: string; // ISO date string
  updatedAt?: string; // Optional update date
  status: "draft" | "published";
}
```

## Architecture

### Key Files

- `src/app/page.tsx` - Registry homepage (lists published experiments only)
- `src/app/experiments/[slug]/page.tsx` - Dynamic experiment routes; drafts accessible in dev only
- `src/experiments/AGENTS.md` - Rules for whoever (usually an agent) is authoring an experiment
- `src/experiments/registry.ts` - Build artefact, gitignored. Regenerated automatically. Never commit it.
- `scripts/registry-lib.ts` - Shared meta loader + strict validator
- `scripts/generate-registry.ts` - Generates `registry.ts` from each `meta.ts` (fails build on invalid meta)
- `scripts/new-experiment.ts` - Scaffolder behind `pnpm experiment:new`
- `scripts/check-experiment.ts` - Verifier behind `pnpm experiment:check`

### Component Library

Uses shadcn/ui components in `src/components/ui/`:

- Button, Card, Badge (pre-installed)
- Add more via `npx shadcn@latest add [component]`

### Styling - Lyra Theme

This project uses the **Lyra** style from shadcn/ui ("Boxy and sharp. Pairs well with mono fonts."):

- Tailwind CSS v4 with CSS-based configuration
- Sharp corners (`--radius: 0`) for boxy appearance
- Monospace typography (JetBrains Mono) throughout
- Neutral color scheme with dark mode support (`.dark` class)
- Theme variables defined in `src/app/globals.css`

## CI Pipeline

GitHub Actions runs on push to `main` and PRs:

| Job            | Description                                               | Blocking                |
| -------------- | --------------------------------------------------------- | ----------------------- |
| **commitlint** | Validates commit messages (PRs only)                      | Yes                     |
| **lint**       | Oxlint + oxfmt + markdownlint + knip                      | Yes (knip non-blocking) |
| **typecheck**  | `tsc --noEmit`                                            | Yes                     |
| **test**       | Vitest with coverage thresholds                           | Yes                     |
| **build**      | Next.js production build (depends on lint/typecheck/test) | Yes                     |
| **audit**      | `pnpm audit --prod`                                       | No                      |
| **secrets**    | Gitleaks secret scanning                                  | Yes                     |
| **ci-status**  | Gate job aggregating all results                          | Yes                     |

Concurrency control cancels in-progress PR runs. All jobs have explicit timeouts.

## RepoWeb — GitHub Proxy for AI Agents

A top-level route (`/repoweb/`) that proxies GitHub's Contents API, serving repository files and directories as plain text for AI agent consumption.

### Key Files

- `src/lib/github.ts` — GitHub Contents API client (fetch, types, error handling)
- `src/app/repoweb/[...path]/route.ts` — Catch-all route handler (URL parsing, response formatting)
- `src/app/repoweb/page.tsx` — Landing/docs page

### URL Pattern

```text
/repoweb/owner/repo/path
```

### How It Works

- Uses GitHub Contents API (`GET /repos/{owner}/{repo}/contents/{path}`) on-demand per request
- No cloning, no persistent storage, no external dependencies
- Responses are `text/plain` with edge caching via `Cache-Control` headers
- Optional `GITHUB_TOKEN` env var for higher rate limits (5,000 vs 60 req/hr)

### Extending

- Branch support: add `ref` query param, pass to GitHub API
- Search: expose GitHub Code Search API via query parameter
- Private repos: use token with `repo` scope
- See `docs/repoweb.md` for full documentation

## Important Notes

- `src/experiments/registry.ts` is a gitignored build artefact regenerated automatically — do not commit it or edit it by hand. The single source of truth for an experiment is its own `meta.ts`.
- All experiments must have `"use client"` if they use React hooks or interactivity
- Cross-experiment helpers go in `src/experiments/_shared/`. Don't reach into `src/lib/` for them — that's sandbox infrastructure. Promotion of a helper to `src/lib/` is a deliberate human action.
- Pre-commit hooks enforce linting/formatting on staged files
- Commits require conventional format with scope: `type(scope): description`
- Run `pnpm validate` before committing to ensure all checks pass
- Experiments with `status: "draft"` are accessible at `/experiments/<slug>` in dev only; in production they 404
