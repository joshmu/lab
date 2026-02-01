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

| Command                  | Description                                |
| ------------------------ | ------------------------------------------ |
| `pnpm dev`               | Start development server with Turbopack    |
| `pnpm build`             | Generate registry and build for production |
| `pnpm start`             | Start production server                    |
| `pnpm lint`              | Run ESLint                                 |
| `pnpm format`            | Format code with Prettier                  |
| `pnpm check-types`       | Run TypeScript type checking               |
| `pnpm test`              | Run tests with Vitest                      |
| `pnpm generate:registry` | Regenerate experiments registry            |
| `pnpm validate`          | Run all checks (lint, types, test, build)  |

## Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4 with shadcn/ui Lyra theme
- **Components**: shadcn/ui (Radix primitives)
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint 9 (flat config)
- **Formatting**: Prettier

## Theme: Lyra

This project uses the **Lyra** style from shadcn/ui:

- **Boxy and sharp** - Zero border-radius for clean, geometric aesthetics
- **Monospace typography** - JetBrains Mono font throughout
- **Neutral colors** - Clean grayscale palette with dark mode support

Theme configuration is in `src/app/globals.css` with CSS variables.

## Project Structure

```
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

## CI/CD

The project includes a GitHub Actions workflow that runs on every push and PR:

- **Lint**: ESLint + Prettier format check
- **Type Check**: TypeScript compilation
- **Test**: Vitest test suite
- **Build**: Production build verification
