# GitHub Copilot Instructions for joshmu/lab

**ALWAYS follow these instructions first. Only fallback to additional search and context gathering if the information provided here is incomplete or found to be in error.**

This is Josh Mu's experimental lab - a Turborepo monorepo for testing modern web development patterns. The codebase uses pnpm workspaces to manage multiple Next.js applications and shared packages.

## Working Effectively

### Bootstrap and Dependencies

- Install dependencies: `pnpm install` -- takes 16 seconds. Always run this first after cloning.
- Verify pnpm version: `pnpm --version` -- should be 9.0.0 as specified in package.json
- DO NOT use npm or yarn - this repository requires pnpm for workspace management

### Build Commands

- **NEVER CANCEL** builds or long-running commands. Set timeout to 60+ minutes for build commands.
- Build all apps and packages: `pnpm build` -- takes 42 seconds. NEVER CANCEL. Includes experiment processing.
- Build experiments only: `cd apps/web && pnpm build:experiments` -- takes ~3 seconds
- Type checking: `pnpm check-types` -- takes 7 seconds across all packages
- Linting: `pnpm lint` -- takes 6 seconds (currently fails due to TypeScript warnings - see Known Issues)
- Formatting: `pnpm format` -- takes 2 seconds

### Development Workflow

- Start all development servers: `pnpm dev` -- starts web app on port 3000 and docs on port 3001
- Start individual apps:
  - Web app: `cd apps/web && pnpm dev` -- http://localhost:3000 (main experimental lab)
  - Docs app: `cd apps/docs && pnpm dev` -- http://localhost:3001 (documentation playground)
- Development servers use Turbopack and start in ~1 second each

### Experiment Processing

- Process experiments: `cd apps/web && npx tsx lib/experiment-processing/process-cli.ts` -- takes ~26ms
- Watch mode: `cd apps/web && pnpm dev:experiments` -- continuous processing during development
- Experiments are located in `apps/web/experiments/` directory

## Validation Requirements

### Manual Validation After Changes

- **ALWAYS** run through complete user scenarios after making changes
- Test the main web application at http://localhost:3000:
  1. Verify homepage loads with "Josh Mu's Lab 🧪" heading
  2. Check experiment explorer section loads properly
  3. Navigate to experiments page at /experiments
  4. Test any modified components or features
- For docs app changes, test at http://localhost:3001:
  1. Verify Turborepo documentation page loads
  2. Test any shared UI components from @repo/ui
- **ALWAYS** take screenshots of UI changes to document the impact

### Pre-Commit Validation

- Run `pnpm check-types` -- NEVER CANCEL, takes 7 seconds
- Run `pnpm format` -- formats all TypeScript and Markdown files
- Build validation: `pnpm build` -- NEVER CANCEL, takes 42 seconds
- If working with experiments: test `cd apps/web && npx tsx lib/experiment-processing/process-cli.ts`

## Architecture Overview

### Monorepo Structure

- **apps/web**: Main experimental Next.js app (port 3000)
- **apps/docs**: Documentation playground (port 3001)
- **packages/ui**: Shared React component library (`@repo/ui`)
- **packages/eslint-config**: Shared ESLint configurations
- **packages/typescript-config**: Shared TypeScript configurations

### Key Technical Decisions

1. **Package Manager**: pnpm v9.0.0 (check package.json packageManager field)
2. **Build System**: Turborepo with task dependencies and caching
3. **Development**: Turbopack enabled (`next dev --turbopack`) for faster builds
4. **TypeScript**: Multiple config presets (base, nextjs, react-library)
5. **ESLint**: v9 with flat config format

### Package Dependencies

- Internal packages use `workspace:*` protocol
- Apps import from `@repo/ui` for shared components
- All packages extend shared TypeScript/ESLint configs

## Important File Locations

### Frequently Modified Files

- UI Components: `packages/ui/src/` -- shared component library
- Web App Components: `apps/web/app/components/`
- Experiment Processing: `apps/web/lib/experiment-processing/`
- Experiments: `apps/web/experiments/` -- organized by category
- Build Scripts: `apps/web/scripts/build-experiments.cjs`

### Configuration Files

- Root package.json: monorepo scripts and pnpm configuration
- turbo.json: Turborepo task configuration with dependencies
- Individual package.json files in each app/package
- TypeScript configs in `packages/typescript-config/`
- ESLint configs in `packages/eslint-config/`

### Documentation

- README.md: Repository overview and getting started
- CLAUDE.md: Claude-specific guidance (reference for AI assistance)
- docs/: Technical specifications and architecture documentation

## Known Issues and Workarounds

### Linting Warnings

- `pnpm lint` currently fails due to TypeScript warnings in the web app
- Common warnings: unused variables, explicit any types, empty interfaces
- These are development warnings and do not prevent builds
- Fix warnings when modifying related files, but DO NOT refactor unrelated code

### Component Generation

- `pnpm generate:component` in packages/ui requires initial Turborepo generator setup
- Use manual component creation following existing patterns in `packages/ui/src/`
- Reference existing components like button.tsx, card.tsx, code.tsx

### Build Dependencies

- Web app build includes experiment processing step
- Experiment processing reads from `apps/web/experiments/` directory
- If experiments directory is missing, build script creates it automatically

## Development Patterns

### Making Changes

1. Always run `pnpm install` if dependencies changed
2. Start development servers: `pnpm dev` or individual app servers
3. Make your changes following existing patterns
4. Run type checking: `pnpm check-types`
5. Format code: `pnpm format`
6. Test manually in browser with screenshots
7. Build to validate: `pnpm build` -- NEVER CANCEL, takes 42 seconds

### Adding New Components

- Shared components: `packages/ui/src/` with TypeScript and React 19
- App-specific components: `apps/web/app/components/` or `apps/docs/app/components/`
- Follow existing naming conventions and export patterns
- Use shared TypeScript configs and ESLint rules

### Working with Experiments

- Create new experiments in `apps/web/experiments/` following category structure
- Run experiment processor after adding new experiments
- Experiments are automatically included in build process
- Experiment metadata is processed for navigation and search

## Common Commands Reference

```bash
# Repository setup
pnpm install                    # 16 seconds - install all dependencies

# Development
pnpm dev                        # Start all apps (web:3000, docs:3001)
cd apps/web && pnpm dev         # Start web app only
cd apps/docs && pnpm dev        # Start docs app only

# Build and validation (NEVER CANCEL)
pnpm build                      # 42 seconds - build all apps and packages
pnpm check-types               # 7 seconds - TypeScript checking
pnpm lint                      # 6 seconds - ESLint (fails with warnings)
pnpm format                    # 2 seconds - Prettier formatting

# Experiment processing
cd apps/web && npx tsx lib/experiment-processing/process-cli.ts  # Process experiments
cd apps/web && pnpm dev:experiments                             # Watch mode
```

## Timeout Requirements

- **CRITICAL**: Set timeout to 60+ minutes for `pnpm build` commands
- **CRITICAL**: Set timeout to 30+ minutes for type checking and linting
- **NEVER CANCEL** any build or test commands even if they appear to hang
- Builds may legitimately take 42+ seconds due to Next.js compilation and experiment processing
