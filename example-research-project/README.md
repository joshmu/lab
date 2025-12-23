# Research Project Architecture Integration

## Overview

This example research project demonstrates the new repository architecture integrated from [Simon Willison's research repository](https://github.com/simonw/research). The architecture enables independent research projects to coexist with the Turborepo monorepo structure.

## Motivation

The Lab repository serves dual purposes:
1. A Turborepo monorepo for web development experiments
2. A research repository for AI-driven investigations

By integrating patterns from simonw/research, we get:
- Clear separation of concerns
- Self-contained research projects
- Automated documentation generation
- AI-friendly workflows

## Architecture Changes

### 1. Flat Directory Structure

Research projects live at the root level of the repository, not nested within apps or packages:

```
lab/
├── apps/              # Monorepo apps
├── packages/          # Monorepo packages
├── research-project-1/  # Independent research
├── research-project-2/  # Independent research
└── example-research-project/  # This project
```

### 2. AGENTS.md Workflow

Created `AGENTS.md` with comprehensive guidelines for AI agents:
- How to create new research projects
- File structure requirements (README.md, notes.md)
- What to include and exclude in commits
- Integration with the monorepo

### 3. CLAUDE.md Symlink

`CLAUDE.md` now symlinks to `AGENTS.md` for compatibility with Claude Code, ensuring both GitHub Copilot and Claude use the same workflow.

### 4. Automated Documentation

GitHub Actions workflow (`.github/workflows/update-readme.yml`) automatically:
- Discovers research projects at the root level
- Generates summaries using LLM (via cogapp)
- Updates the main README.md
- Caches summaries in `_summary.md` files

### 5. cogapp Integration

The main README.md uses [cogapp](https://nedbatchelder.com/code/cog/) markers to dynamically generate the research projects list:

```python
<!--[[[cog
# Python code to discover and list projects
]]]-->
Generated content here
<!--[[[end]]]-->
```

## Key Components

### requirements.txt
```
cogapp
llm
llm-github-models
```

### GitHub Actions Workflow
- Triggered on push to main
- Installs Python dependencies
- Runs cogapp to regenerate README
- Commits changes automatically

## Benefits

### For Research Projects
- **Self-contained**: Each project has everything it needs
- **Portable**: Easy to extract and share
- **Documented**: Automated summary generation
- **Discoverable**: Automatically listed in main README

### For AI Agents
- **Clear guidelines**: AGENTS.md provides workflow
- **Consistent structure**: Same pattern across all projects
- **Automated maintenance**: No manual README updates

### For the Monorepo
- **Separation**: Research doesn't interfere with monorepo builds
- **Flexibility**: Choose between integrated features or standalone research
- **Documentation**: Both structures coexist harmoniously

## Usage

### Creating a New Research Project

1. Create a directory at the root level:
   ```bash
   mkdir my-research-topic
   ```

2. Add a notes.md file as you work:
   ```bash
   echo "# Notes" > my-research-topic/notes.md
   ```

3. Create a comprehensive README.md at the end:
   ```bash
   # Document findings, code, results
   ```

4. Commit only essential files (no node_modules, build artifacts, etc.)

5. The GitHub Action will automatically:
   - Generate a summary
   - Update the main README
   - Add your project to the list

### Testing Locally

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run cogapp manually
cog -r -P README.md
```

## Technical Details

### Cogapp Execution
The cogapp script in README.md:
1. Lists all directories (excluding apps, packages, .github, etc.)
2. Gets first commit date for chronological sorting
3. Checks for cached `_summary.md` files
4. If no cache, generates summary using `llm -m github/gpt-4.1`
5. Saves generated summaries to `_summary.md` for reuse

### LLM Integration
Uses the [llm](https://llm.datasette.io/) CLI tool with GitHub Models provider:
- Model: `github/gpt-4.1`
- Custom prompt for concise, link-rich summaries
- Automatic caching to avoid regeneration

## Differences from simonw/research

While heavily inspired by Simon Willison's research repository, this implementation:
- **Coexists with Turborepo**: Maintains monorepo structure for apps/packages
- **Flexible approach**: Research can be standalone OR integrated
- **Preserved build system**: Turborepo build, dev, and lint still work
- **Documentation notes**: AGENTS.md tailored for dual-purpose repo

## Next Steps

Potential improvements:
- Add more example research projects
- Create templates for common research types
- Add badges showing research project count
- Integrate research metrics dashboard

## References

- **Simon Willison's research repo**: https://github.com/simonw/research
- **Blog post**: https://simonwillison.net/2025/Nov/6/async-code-research/
- **cogapp**: https://nedbatchelder.com/code/cog/
- **llm CLI**: https://llm.datasette.io/
- **GitHub Models**: https://github.com/marketplace/models

## Conclusion

This architecture integration successfully combines:
- Turborepo's monorepo capabilities for web development
- Research repository patterns for AI-driven investigations
- Automated documentation generation
- Clear workflows for both humans and AI agents

The result is a flexible, maintainable structure that supports both rapid experimentation and thorough research documentation.
