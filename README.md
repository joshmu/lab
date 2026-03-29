# Lab

A personal experiments registry for web development explorations. Built with Next.js 15 and the shadcn/ui Lyra theme for a sharp, modern aesthetic.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

## Creating an Experiment

1. Create a new folder in `src/experiments/`:

```bash
mkdir src/experiments/my-experiment
```

2. Add a metadata file (`meta.ts`):

```typescript
import type { ExperimentMeta } from "@/lib/types";

export const meta: ExperimentMeta = {
  slug: "my-experiment",
  title: "My Experiment",
  description: "A brief description of what this experiment demonstrates",
  tags: ["react", "css"],
  createdAt: "2024-01-26",
  status: "published", // or "draft" to hide from registry
};
```

3. Create the experiment component (`index.tsx`):

```tsx
"use client";

export default function MyExperiment() {
  return (
    <div>
      <h2>My Experiment</h2>
      {/* Your experiment code here */}
    </div>
  );
}
```

4. Regenerate the registry:

```bash
pnpm generate:registry
```

5. Your experiment will now appear on the homepage and be accessible at `/experiments/my-experiment`

## Commands

| Command                  | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `pnpm dev`               | Start development server with Turbopack           |
| `pnpm build`             | Generate registry and build for production        |
| `pnpm start`             | Start production server                           |
| `pnpm lint`              | Run Oxlint                                        |
| `pnpm format`            | Format code with oxfmt                            |
| `pnpm format:check`      | Check formatting                                  |
| `pnpm lint:md`           | Lint markdown files                               |
| `pnpm lint:knip`         | Dead code detection                               |
| `pnpm check-types`       | Run TypeScript type checking                      |
| `pnpm test`              | Run tests with Vitest                             |
| `pnpm test:coverage`     | Run tests with coverage                           |
| `pnpm audit`             | Dependency vulnerability scan                     |
| `pnpm generate:registry` | Regenerate experiments registry                   |
| `pnpm validate`          | Run all checks (lint, format, types, test, build) |

## Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4 with shadcn/ui Lyra theme
- **Components**: shadcn/ui (Radix primitives)
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library
- **Linting**: Oxlint (react, typescript, unicorn plugins)
- **Formatting**: oxfmt (with Tailwind class sorting)

## Theme: Lyra

This project uses the **Lyra** style from shadcn/ui:

- **Boxy and sharp** - Zero border-radius for clean, geometric aesthetics
- **Monospace typography** - JetBrains Mono font throughout
- **Neutral colors** - Clean grayscale palette with dark mode support

Theme configuration is in `src/app/globals.css` with CSS variables.

## Project Structure

```text
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Registry homepage
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Lyra theme + Tailwind
│   └── experiments/
│       └── [slug]/        # Dynamic experiment routes
├── components/
│   └── ui/                # shadcn/ui components
├── experiments/           # Experiment definitions
│   ├── registry.ts        # Auto-generated registry
│   └── [name]/
│       ├── index.tsx      # Experiment component
│       └── meta.ts        # Experiment metadata
├── lib/
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Utility functions
└── test/
    └── setup.ts           # Test configuration
```

## RepoWeb

A built-in GitHub repository proxy for AI agents. Browse any public repo as plain text:

```text
lab.joshmu.com/repoweb/owner/repo/path
```

All responses are `text/plain` — no rendering, just raw content optimized for AI consumption. See [docs/repoweb.md](docs/repoweb.md) for full documentation.

## Validation

### Pre-commit Hooks

Husky + lint-staged run on every commit:

- **Oxlint** + **oxfmt** on staged `.ts`/`.tsx` files
- **oxfmt** on staged `.json`/`.css` files
- **markdownlint** on staged `.md` files
- **commitlint** on commit messages (conventional commits with required scope)

### CI/CD

GitHub Actions runs on push to `main` and PRs:

| Job        | Description                          | Blocking                |
| ---------- | ------------------------------------ | ----------------------- |
| commitlint | Validates commit messages (PRs only) | Yes                     |
| lint       | Oxlint + oxfmt + markdownlint + knip | Yes (knip non-blocking) |
| typecheck  | TypeScript type checking             | Yes                     |
| test       | Vitest with coverage thresholds      | Yes                     |
| build      | Next.js production build             | Yes                     |
| audit      | pnpm audit                           | No                      |
| secrets    | Gitleaks secret scanning             | Yes                     |
| ci-status  | Gate job (aggregates all results)    | Yes                     |
