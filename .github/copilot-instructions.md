# GitHub Copilot Instructions for Josh Mu's Lab

This file provides specific instructions for GitHub Copilot when working with this experimental monorepo.

## Repository Context

Josh Mu's Lab is an experimental Turborepo monorepo for testing modern web development patterns. This is a space for creative experimentation, breaking things, and learning new technologies.

### Architecture Overview

- **Turborepo monorepo** with pnpm workspaces
- **Next.js 15** with React 19 for cutting-edge features
- **TypeScript** throughout for type safety
- **Turbopack** enabled for fast development builds
- **ESLint v9** with flat config format

### Project Structure

```
apps/
├── web/           # Main Next.js experimental app (port 3000)
├── docs/          # Documentation playground (port 3001)
packages/
├── ui/            # Shared React components (@repo/ui)
├── eslint-config/ # Shared ESLint configurations
├── typescript-config/ # Shared TypeScript configurations
```

## Development Guidelines

### Package Management

- Use **pnpm v9.0.0** exclusively (specified in package.json)
- Internal packages use `workspace:*` protocol
- All packages extend shared TypeScript/ESLint configs

### Essential Commands

```bash
pnpm install         # Install dependencies
pnpm dev            # Start all apps (web:3000, docs:3001)
pnpm build          # Build all apps and packages
pnpm lint           # Run ESLint across all packages
pnpm check-types    # Run TypeScript type checking
pnpm format         # Format code with Prettier
pnpm generate:component # Generate new React components (from packages/ui)
```

### Development Workflow

- Both Next.js apps use Turbopack: `next dev --turbopack`
- UI package exports components through `src/index.tsx`
- Component generation uses Turborepo's gen feature
- All packages must pass type checking before builds

## Code Style & Patterns

### TypeScript

- Multiple config presets: base, nextjs, react-library
- Strict type checking enabled
- Use proper typing, avoid `any` where possible

### React Components

- Import shared components from `@repo/ui`
- Follow existing component patterns in packages/ui
- Use TypeScript interfaces for component props

### File Organization

- Experiments go in `apps/web/experiments/[category]/[experiment-name]/`
- Each experiment requires a `metadata.json` file with structured information
- Shared components in `packages/ui/src/`
- Follow existing directory structure patterns

### Experiment Structure

Each experiment should include:

- `metadata.json` - Required structured metadata including:
  - Basic info: id, title, description, slug, category
  - Technical: techStack, difficulty, status, version
  - Educational: prerequisites, learningObjectives
  - Metadata: tags, keywords, author, timestamps
- Component files (`.tsx` for React components)
- Follow naming convention: `[category]/[experiment-name]`

## Experimental Nature

This is an experimental lab where:

- Breaking changes are expected and welcomed
- New technologies are actively tested
- Iteration speed is prioritized over stability
- Creative solutions are encouraged

## Build System

### Turborepo Configuration

- Tasks have dependency chains (build depends on ^build)
- Caching enabled for build optimization
- Special handling for experiments via `build:experiments` task
- Experiment processing system in `lib/experiment-processing/`

### Experiment Processing

- Automated metadata validation and processing
- Navigation tree generation from experiment structure
- Build-time experiment discovery and organization

### Environment

- Node.js >=18 required
- Development with hot reloading enabled
- Build artifacts in `.next/` directories

## When Working with This Repository

1. **Respect the experimental nature** - suggest modern, cutting-edge solutions
2. **Use the monorepo structure** - leverage shared packages appropriately
3. **Follow TypeScript best practices** - maintain type safety
4. **Consider performance** - this is a testing ground for optimization techniques
5. **Suggest improvements** - this is a learning environment

## Special Considerations

- Some lint warnings are acceptable in experimental code
- Turbopack is enabled by default for faster development
- Component generation should use existing Turborepo generators
- New experiments should follow the established patterns in `apps/web/experiments/`

## Related Documentation

- `CLAUDE.md` - Instructions for Claude AI assistant
- `README.md` - General repository information
- Individual package READMEs for specific guidance
