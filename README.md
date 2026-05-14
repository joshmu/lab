# Lab

A sandbox for agents to drop single-page ideas into. The sandbox handles registration, routing, validation, and discovery; the experiment author (typically an AI agent) focuses on the idea itself. See [ADR-0001](./docs/adr/0001-sandbox-for-agents.md) for the framing.

## Quick Start

```bash
pnpm install
pnpm dev   # http://localhost:3000
```

## Creating an Experiment

```bash
pnpm experiment:new my-experiment    # scaffolds folder + meta.ts + index.tsx
# edit src/experiments/my-experiment/index.tsx
pnpm experiment:check my-experiment  # validates meta + default export
```

Drafts (`status: "draft"`) are accessible at `/experiments/<slug>` in dev so you can preview without flipping flags. Flip to `"published"` when ready and the experiment appears on the homepage.

Full agent-author rules: [`src/experiments/AGENTS.md`](./src/experiments/AGENTS.md).
Domain vocabulary: [`CONTEXT.md`](./CONTEXT.md).

## Commands

| Command                        | Description                                              |
| ------------------------------ | -------------------------------------------------------- |
| `pnpm experiment:new <slug>`   | Scaffold a new experiment (folder + meta.ts + index.tsx) |
| `pnpm experiment:check <slug>` | Validate an experiment's meta + default export           |
| `pnpm dev`                     | Start dev server (regenerates registry first)            |
| `pnpm build`                   | Generate registry + production build                     |
| `pnpm start`                   | Start production server                                  |
| `pnpm lint`                    | Run Oxlint                                               |
| `pnpm format`                  | Format code with oxfmt                                   |
| `pnpm format:check`            | Check formatting                                         |
| `pnpm lint:md`                 | Lint markdown files                                      |
| `pnpm lint:knip`               | Dead code detection                                      |
| `pnpm check-types`             | Run TypeScript type checking                             |
| `pnpm test`                    | Run tests with Vitest                                    |
| `pnpm test:coverage`           | Run tests with coverage                                  |
| `pnpm audit`                   | Dependency vulnerability scan                            |
| `pnpm generate:registry`       | Regenerate experiments registry (rarely needed manually) |
| `pnpm validate`                | Run all checks (lint, format, types, test, build)        |

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
│   ├── registry.ts        # Generated build artefact (gitignored)
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
lab.joshmu.dev/repoweb/owner/repo/path
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
