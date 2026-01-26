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
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm check-types      # TypeScript type checking
pnpm test             # Run Vitest tests
pnpm validate         # Run all checks
```

## Creating a New Experiment

1. Create folder: `src/experiments/[experiment-name]/`
2. Add `meta.ts` with experiment metadata
3. Add `index.tsx` with the experiment component (must be default export)
4. Run `pnpm generate:registry` to update the registry
5. The experiment will appear on the homepage if `status: "published"`

### Experiment Metadata Schema

```typescript
interface ExperimentMeta {
  slug: string;           // URL slug (should match folder name)
  title: string;          // Display title
  description: string;    // Brief description
  tags: string[];         // Categorization tags
  createdAt: string;      // ISO date string
  updatedAt?: string;     // Optional update date
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
- Add more as needed from shadcn/ui docs

### Styling
- Tailwind CSS v4 with CSS-based configuration
- Custom theme colors defined in `src/app/globals.css`
- Dark mode support via `prefers-color-scheme`

## Important Notes

- The registry is auto-generated - don't edit `src/experiments/registry.ts` manually
- All experiments must have `"use client"` if they use React hooks or interactivity
- Run `pnpm validate` before committing to ensure all checks pass
- Experiments with `status: "draft"` won't appear on the homepage
