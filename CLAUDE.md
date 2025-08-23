# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is Josh Mu's experimental lab - a Turborepo monorepo for testing modern web development patterns. The codebase uses pnpm workspaces to manage multiple Next.js applications and shared packages.

## Essential Commands

```bash
# Development
pnpm dev          # Start all apps (web on :3000, docs on :3001)
pnpm build        # Build all apps and packages
pnpm lint         # Run ESLint across all packages
pnpm check-types  # Run TypeScript type checking
pnpm format       # Format code with Prettier

# Component Generation (from packages/ui)
pnpm generate:component  # Generate new React components
```

## Architecture

### Monorepo Structure

- **apps/web**: Main Next.js app for experiments
- **apps/docs**: Documentation playground
- **packages/ui**: Shared React components (`@repo/ui`)
- **packages/eslint-config**: Shared ESLint configurations
- **packages/typescript-config**: Shared TypeScript configurations

### Key Technical Decisions

1. **Package Manager**: pnpm v9.0.0 (check pnpm-lock.yaml)
2. **Build System**: Turborepo with task dependencies and caching
3. **Development**: Turbopack enabled for faster builds
4. **TypeScript**: Multiple config presets (base, nextjs, react-library)
5. **ESLint**: v9 with flat config format

### Package Dependencies

- Internal packages use `workspace:*` protocol
- Apps import from `@repo/ui` for shared components
- All packages extend shared TypeScript/ESLint configs

## Important Notes

- Both Next.js apps use Turbopack in development (`next dev --turbopack`)
- The UI package exports components through `src/index.tsx`
- Component generation uses Turborepo's gen feature
- All packages must pass type checking before builds
