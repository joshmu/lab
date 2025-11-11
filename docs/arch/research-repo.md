# Research Repository Architecture

## Overview

The Lab repository now supports two complementary workflows:

1. **Turborepo Monorepo**: Traditional web development with apps and packages
2. **Research Projects**: Independent AI-driven investigations at the root level

This architecture was inspired by [Simon Willison's research repository](https://github.com/simonw/research) and adapted to coexist with our existing Turborepo structure.

## Key Components

### 1. AGENTS.md

Provides comprehensive guidelines for AI agents (Claude Code, GitHub Copilot, etc.) on how to:
- Create new research projects
- Structure files (README.md, notes.md)
- Follow commit best practices
- Integrate with the monorepo

### 2. CLAUDE.md Symlink

`CLAUDE.md` is now a symlink to `AGENTS.md`, ensuring:
- Single source of truth
- Compatibility with multiple AI tools
- Reduced maintenance overhead

### 3. Automated Documentation (cogapp)

The main README.md uses [cogapp](https://nedbatchelder.com/code/cog/) to automatically:
- Discover research projects at the root level
- Generate project summaries using LLM
- Cache summaries in `_summary.md` files
- Create links to GitHub project directories

### 4. GitHub Actions Workflow

`.github/workflows/update-readme.yml` automatically:
- Runs on every push to main
- Executes cogapp to regenerate README
- Commits changes back to repository
- Keeps documentation up to date

### 5. Python Dependencies

`requirements.txt` includes:
- `cogapp` - Code generation and documentation
- `llm` - LLM CLI tool for summaries
- `llm-github-models` - GitHub Models provider

## Directory Structure

```
lab/
├── .github/
│   └── workflows/
│       └── update-readme.yml     # Auto-update workflow
├── apps/                         # Monorepo apps
│   ├── web/                      # Main Next.js app
│   └── docs/                     # Documentation
├── packages/                     # Monorepo packages
│   ├── ui/                       # Shared components
│   ├── eslint-config/           # ESLint configs
│   └── typescript-config/       # TypeScript configs
├── docs/                         # Project documentation
│   └── arch/
│       └── research-repo.md     # This file
├── example-research-project/    # Example research
│   ├── README.md                # Full report
│   ├── notes.md                 # Research journal
│   └── _summary.md              # Cached summary
├── AGENTS.md                     # AI agent guidelines
├── CLAUDE.md -> AGENTS.md        # Symlink
├── README.md                     # Main documentation (with cogapp)
└── requirements.txt              # Python dependencies
```

## Research Project Structure

Each research project should contain:

### Required Files

1. **README.md** - Comprehensive report with:
   - Title and overview
   - Motivation
   - Key findings (with bullet points)
   - Technical details
   - Results and conclusions
   - References and links

2. **notes.md** - Research journal tracking:
   - What you tried
   - What worked/didn't work
   - Commands executed
   - Errors and solutions
   - Resources consulted

### Optional Files

3. **_summary.md** - Auto-generated summary (cached)
4. **Code files** - Scripts, implementations, tests
5. **Configuration** - package.json, requirements.txt, etc.

### Do NOT Include

- `node_modules/` or dependency directories
- Build artifacts (`.next/`, `dist/`, etc.)
- Large binary files (> 2MB)
- Temporary or cache files
- Full clones of external repositories

## Workflow

### Creating a Research Project

1. **Create directory at root level**:
   ```bash
   mkdir my-research-topic
   cd my-research-topic
   ```

2. **Track work in notes.md**:
   ```bash
   echo "# Notes for My Research" > notes.md
   # Append notes as you work
   ```

3. **Create comprehensive README.md**:
   ```bash
   # Document findings, code, results
   ```

4. **Commit essential files**:
   ```bash
   git add .
   git commit -m "Add my-research-topic investigation"
   ```

5. **Automated processing**:
   - Push triggers GitHub Action
   - cogapp discovers your project
   - LLM generates summary (if configured)
   - README.md is updated automatically

### Testing Locally

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run cogapp manually
cog -r -P README.md
```

## Integration with Monorepo

### Separation of Concerns

- **Research projects**: Root-level directories
- **Monorepo code**: `apps/` and `packages/` directories
- **Documentation**: `docs/` directory
- **Configuration**: Root-level config files

### Build System

Research projects do NOT interfere with monorepo builds:

```bash
# These commands still work as expected
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

### When to Use Each Approach

**Create a research project** when:
- Investigating a new technology or pattern
- Conducting experiments or benchmarks
- Documenting findings for future reference
- Testing ideas that may not integrate

**Integrate into monorepo** when:
- Building a reusable component
- Creating a new app or feature
- Sharing code across multiple apps
- Production-ready implementations

## Benefits

### For Research

- **Self-contained**: Everything in one directory
- **Portable**: Easy to extract and share
- **Documented**: Automated summary generation
- **Discoverable**: Listed in main README

### For AI Agents

- **Clear guidelines**: AGENTS.md workflow
- **Consistent structure**: Same pattern everywhere
- **Automated maintenance**: No manual README updates
- **Flexible**: Choose monorepo or research approach

### For the Monorepo

- **Separation**: Research doesn't break builds
- **Documentation**: Both approaches documented
- **Flexibility**: Support different workflows
- **Organization**: Clear project boundaries

## Differences from simonw/research

While inspired by Simon Willison's repository, this implementation:

1. **Coexists with Turborepo**: Maintains monorepo for production code
2. **Dual purpose**: Research AND development in one repo
3. **Graceful degradation**: Works without LLM tools
4. **Flexible integration**: Can move research to monorepo

## Future Enhancements

Potential improvements:

1. **Templates**: Generate research project scaffolding
2. **Metrics**: Track research project count and activity
3. **Badges**: Show project status and dates
4. **Dashboard**: Visual overview of all research
5. **CI Integration**: Run tests on research projects

## References

- **Simon Willison's research repo**: https://github.com/simonw/research
- **Blog post**: https://simonwillison.net/2025/Nov/6/async-code-research/
- **cogapp**: https://nedbatchelder.com/code/cog/
- **llm CLI**: https://llm.datasette.io/
- **Turborepo**: https://turbo.build/repo

## Questions?

See:
- [AGENTS.md](../../AGENTS.md) for detailed workflow guidelines
- [README.md](../../README.md) for main documentation
- [example-research-project](../../example-research-project/README.md) for a complete example
