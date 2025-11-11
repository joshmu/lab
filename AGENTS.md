# Agent Guidelines for Research and Experiments

This file provides guidance for AI agents (Claude Code, GitHub Copilot, etc.) when conducting research or creating experiments in this repository.

## Workflow for Creating New Research/Experiments

When starting a new research project or experiment:

### 1. Create a New Directory

Create a new folder at the **root level** of the repository with an appropriate name that describes your research or experiment. Use kebab-case naming (e.g., `async-patterns-research`, `react-19-features`, `webassembly-performance`).

### 2. Track Your Work with notes.md

Create a `notes.md` file in that folder and append notes to it as you work. This should include:
- What you tried
- What worked and what didn't
- Interesting findings
- Commands you ran
- Errors encountered and how you solved them
- Links to resources and documentation

Think of this as your research journal - be thorough and detailed.

### 3. Build a README.md Report

At the end of your investigation or as you make progress, create or update a comprehensive `README.md` file that includes:
- **Title and Overview**: Clear description of what this research/experiment is about
- **Motivation**: Why this research/experiment was conducted
- **Key Findings**: Main discoveries and insights (use bullet points)
- **Technical Details**: Implementation details, code examples, benchmarks
- **Results**: What you learned, performance metrics, comparison data
- **References**: Links to relevant tools, libraries, documentation
- **Next Steps** (optional): Future directions or improvements

### 4. Final Commit Guidelines

Your final commit should include **only** the following from your research folder:

#### Include:
- ✅ `notes.md` - Your research journal
- ✅ `README.md` - Your comprehensive report
- ✅ Any code you wrote along the way
- ✅ Configuration files (package.json, tsconfig.json, etc.)
- ✅ If you modified an existing repo, save the output of `git diff` as a file
- ✅ Binary files you created, **provided they are less than 2MB**

#### Do NOT Include:
- ❌ Full copies of external code/repositories you cloned
- ❌ node_modules or other dependency directories
- ❌ Build artifacts (.next, dist, out directories)
- ❌ Large binary files (> 2MB)
- ❌ Temporary or cache files

### 5. Let Automation Handle Summaries

**Do NOT create a `_summary.md` file** - these are added automatically by GitHub Actions after you commit your changes. The automation will:
- Generate concise summaries using AI
- Update the main README.md with your project
- Cache summaries for faster subsequent builds

## Best Practices

### Code Organization
- Keep experiments self-contained within their directory
- Include a package.json or requirements.txt if your experiment has dependencies
- Document how to run your code in the README

### Documentation Style
- Write for both AI agents and humans
- Include code examples and outputs
- Link to external resources
- Use markdown formatting effectively (code blocks, lists, tables)

### Commit Messages
- Use descriptive commit messages
- Reference what you learned or accomplished
- Follow conventional commits format when appropriate

### Research Quality
- Be thorough in your investigation
- Test edge cases and alternatives
- Include benchmarks when relevant
- Document failures as well as successes

## Integration with Existing Monorepo

This repository is also a Turborepo monorepo with:
- **apps/web**: Main Next.js experimental app
- **apps/docs**: Documentation playground
- **packages/**: Shared packages

When your research/experiment fits better as:
- **A standalone research project**: Create it at the root level following these guidelines
- **An integrated feature**: Add it to `apps/web` or create a new app
- **A reusable component**: Add it to `packages/ui` or create a new package

## Tool Usage

### For JavaScript/TypeScript Projects
- Use `pnpm` for package management
- Run `pnpm install` to install dependencies
- Use `pnpm dev` or `pnpm build` as appropriate

### For Python Projects
- Create a virtual environment
- Use `pip install -r requirements.txt` if you have dependencies
- Document Python version requirements

### For Other Languages
- Document setup and build instructions clearly
- Include any special tools or compilers needed

## Questions or Clarifications?

If you're unsure about:
- Whether to create a standalone research directory vs. integrating into the monorepo
- How to structure your research
- What level of detail is appropriate

Default to creating a **standalone research directory** with thorough documentation. It's easier to integrate later than to extract.
