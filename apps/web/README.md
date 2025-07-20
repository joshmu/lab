This is the main Next.js application for [lab.joshmu.dev](https://lab.joshmu.dev) - Josh Mu's experimental lab for testing modern web development patterns.

## Getting Started

This is the main web application for Josh Mu's experimental lab.

### Development

```bash
pnpm dev  # Starts the development server on port 3000
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### About This Lab

This experimental lab is used for:
- Testing modern web development patterns
- Exploring new React features and Next.js capabilities
- Prototyping UI components and interactions
- Experimenting with build tools and monorepo structures

## Architecture

This app is part of a Turborepo monorepo that includes:
- **apps/web**: This main experimental lab application
- **apps/docs**: Documentation playground
- **packages/ui**: Shared React components library
- **packages/eslint-config**: Shared ESLint configurations
- **packages/typescript-config**: Shared TypeScript configurations

## Live Site

Visit the live experimental lab at [lab.joshmu.dev](https://lab.joshmu.dev)

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Turborepo for monorepo management
- pnpm for package management
- Shared UI components via @repo/ui
