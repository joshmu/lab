This is the documentation playground Next.js application for [lab.joshmu.dev](https://lab.joshmu.dev).

## Getting Started

This is the documentation playground for lab.joshmu.dev experiments.

### Development

```bash
pnpm dev  # Starts the documentation server on port 3001
```

Visit [http://localhost:3001](http://localhost:3001) to view the documentation playground.

### Purpose

This docs app serves as:

- A playground for testing documentation patterns
- A showcase for shared UI components from @repo/ui
- An example of multi-app Turborepo architecture

## Integration with Main Lab

This documentation app:

- Shares UI components with the main lab app via @repo/ui
- Uses the same TypeScript and ESLint configurations
- Runs alongside the main app in the Turborepo workspace
- Demonstrates component usage and patterns

## Monorepo Commands

Run from the root of the monorepo:

```bash
pnpm dev          # Start all apps
pnpm build        # Build all apps and packages
pnpm lint         # Lint all packages
pnpm check-types  # Type check all packages
```
