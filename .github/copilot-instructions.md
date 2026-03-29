# GitHub Copilot Instructions for Lab

## Repository Context

Lab is a Next.js experiments registry for creating and showcasing web development experiments. Each experiment is a standalone page that gets automatically listed on the homepage.

### Architecture

- **Next.js 15** with App Router and React 19
- **TypeScript 5.x** with strict mode
- **Tailwind CSS v4** with shadcn/ui Lyra theme (boxy, sharp, monospace)
- **pnpm** package manager (v9.0.0)

### Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Registry homepage
│   ├── experiments/[slug]/ # Dynamic experiment routes
│   └── repoweb/           # GitHub proxy for AI agents
├── components/ui/          # shadcn/ui components
├── experiments/            # Experiment definitions
│   └── [name]/
│       ├── index.tsx       # Experiment component (default export)
│       └── meta.ts         # Experiment metadata
├── lib/                    # Shared utilities and types
└── test/                   # Test setup
```

## Development Guidelines

### Essential Commands

```bash
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Generate registry + production build
pnpm validate         # Run all checks
pnpm lint             # Run Oxlint
pnpm format           # Format with oxfmt
pnpm test             # Run Vitest tests
pnpm generate:registry # Regenerate experiments registry
```

### Tooling

- **Linting**: Oxlint (react, typescript, unicorn plugins)
- **Formatting**: oxfmt (with Tailwind class sorting)
- **Testing**: Vitest + Testing Library (jsdom)
- **Coverage**: v8 provider with thresholds
- **Markdown**: markdownlint-cli2
- **Dead code**: knip (non-blocking)

### Commit Conventions

All commits must use conventional format with a **required scope**:

```text
type(scope): description
```

Enforced by commitlint (pre-commit hook + CI).

### Pre-commit Hooks

Husky + lint-staged enforce:

- Oxlint + oxfmt on `.ts`/`.tsx` files
- oxfmt on `.json`/`.css` files
- markdownlint on `.md` files

### Creating Experiments

1. Create folder: `src/experiments/[name]/`
2. Add `meta.ts` with metadata (slug, title, description, tags, createdAt, status)
3. Add `index.tsx` with default export component
4. Run `pnpm generate:registry`
5. Published experiments appear on the homepage

### Code Style

- Use TypeScript strict mode, avoid `any` where possible
- Use `"use client"` for components with React hooks or interactivity
- Follow shadcn/ui patterns for UI components
- Don't edit `src/experiments/registry.ts` (auto-generated)

## Related Documentation

- `CLAUDE.md` - Detailed AI assistant instructions
- `docs/repoweb.md` - RepoWeb proxy documentation
