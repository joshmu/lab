# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Overview

This is an experiments registry - a Next.js application for creating and showcasing web development experiments. Each experiment is a standalone page that gets automatically listed on the homepage.

## Essential Commands

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Generate registry + production build
pnpm generate:registry # Regenerate experiments registry

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

1. Create folder: `src/experiments/[experiment-name]/`
2. Add `meta.ts` with experiment metadata
3. Add `index.tsx` with the experiment component (must be default export)
4. Run `pnpm generate:registry` to update the registry
5. The experiment will appear on the homepage if `status: "published"`

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

- `src/app/page.tsx` - Registry homepage
- `src/app/experiments/[slug]/page.tsx` - Dynamic experiment routes
- `src/experiments/registry.ts` - Auto-generated from experiment metadata
- `scripts/generate-registry.ts` - Registry generation script

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

- The registry is auto-generated - don't edit `src/experiments/registry.ts` manually
- All experiments must have `"use client"` if they use React hooks or interactivity
- Pre-commit hooks enforce linting/formatting on staged files
- Commits require conventional format with scope: `type(scope): description`
- Run `pnpm validate` before committing to ensure all checks pass
- Experiments with `status: "draft"` won't appear on the homepage
