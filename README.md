# Lab 🧪

## About

A space to selfishly experiment freely and break things. This repository serves two purposes:

1. **Turborepo Monorepo**: A modern web development workspace with Next.js apps and shared packages
2. **Research Projects**: Independent investigations and experiments carried out by AI tools

## Turborepo Workspace

This Turborepo includes:

### Apps and Packages

- `apps/web`: Main experimental Next.js app
- `apps/docs`: Documentation playground (because even experiments need docs sometimes)
- `packages/ui`: Shared React component library for testing component patterns
- `packages/eslint-config`: Shared ESLint configurations
- `packages/typescript-config`: Shared TypeScript configurations

### Tech Stack

- **Turborepo** - High-performance build system for JavaScript and TypeScript codebases
- **Next.js 15** - Latest features and experiments
- **React 19** - Cutting edge React features
- **TypeScript** - Because type safety makes experimentation safer
- **pnpm** - Fast, disk space efficient package manager

### Getting Started

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Build all apps and packages
pnpm build

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

## Research Projects

Each top-level directory (excluding `apps/`, `packages/`, `docs/`, and `.github/`) represents an independent research project or experiment. These are typically carried out by AI tools like [Claude Code](https://www.claude.com/product/claude-code) or [GitHub Copilot](https://github.com/features/copilot).

### Creating Research Projects

See [AGENTS.md](./AGENTS.md) for detailed guidelines on how to create and structure research projects in this repository.

### Research Project List

<!--[[[cog
import os
import subprocess
import pathlib
from datetime import datetime

# Model to use for generating summaries
MODEL = "github/gpt-4.1"

# Directories to exclude from research project list
EXCLUDE_DIRS = {'.git', '.github', 'apps', 'packages', 'docs', 'node_modules', '.next', 'dist', '.vscode'}

# Get all subdirectories with their first commit dates
research_dir = pathlib.Path.cwd()
subdirs_with_dates = []

for d in research_dir.iterdir():
    if d.is_dir() and d.name not in EXCLUDE_DIRS and not d.name.startswith('.'):
        # Get the date of the first commit that touched this directory
        try:
            result = subprocess.run(
                ['git', 'log', '--diff-filter=A', '--follow', '--format=%aI', '--reverse', '--', d.name],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0 and result.stdout.strip():
                # Parse first line (oldest commit)
                date_str = result.stdout.strip().split('\n')[0]
                commit_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                subdirs_with_dates.append((d.name, commit_date))
            else:
                # No git history, use directory modification time
                subdirs_with_dates.append((d.name, datetime.fromtimestamp(d.stat().st_mtime)))
        except Exception:
            # Fallback to directory modification time
            subdirs_with_dates.append((d.name, datetime.fromtimestamp(d.stat().st_mtime)))

# Sort by date, most recent first
subdirs_with_dates.sort(key=lambda x: x[1], reverse=True)

if not subdirs_with_dates:
    print("*No research projects yet. Create a new directory at the root level to start your first research project!*")
else:
    for dirname, commit_date in subdirs_with_dates:
        folder_path = research_dir / dirname
        readme_path = folder_path / "README.md"
        summary_path = folder_path / "_summary.md"

        date_formatted = commit_date.strftime('%Y-%m-%d')

        # Get GitHub repo URL
        github_url = None
        try:
            result = subprocess.run(
                ['git', 'remote', 'get-url', 'origin'],
                capture_output=True,
                text=True,
                timeout=2
            )
            if result.returncode == 0 and result.stdout.strip():
                origin = result.stdout.strip()
                # Convert SSH URL to HTTPS URL for GitHub
                if origin.startswith('git@github.com:'):
                    origin = origin.replace('git@github.com:', 'https://github.com/')
                if origin.endswith('.git'):
                    origin = origin[:-4]
                github_url = f"{origin}/tree/main/{dirname}"
        except Exception:
            pass

        if github_url:
            print(f"### [{dirname}]({github_url}) ({date_formatted})\n")
        else:
            print(f"### {dirname} ({date_formatted})\n")

        # Check if summary already exists
        if summary_path.exists():
            # Use cached summary
            with open(summary_path, 'r') as f:
                description = f.read().strip()
                if description:
                    print(description)
                else:
                    print("*No description available.*")
        elif readme_path.exists():
            # Generate new summary using llm command
            prompt = """Summarize this research project concisely. Write just 1 paragraph (3-5 sentences) followed by an optional short bullet list if there are key findings. Vary your opening - don't start with "This report" or "This research". Include 1-2 links to key tools/projects. Be specific but brief. No emoji."""
            result = subprocess.run(
                ['llm', '-m', MODEL, '-s', prompt],
                stdin=open(readme_path),
                capture_output=True,
                text=True,
                timeout=60
            )
            if result.returncode != 0:
                error_msg = f"LLM command failed for {dirname} with return code {result.returncode}"
                if result.stderr:
                    error_msg += f"\nStderr: {result.stderr}"
                raise RuntimeError(error_msg)
            if result.stdout.strip():
                description = result.stdout.strip()
                print(description)
                # Save to cache file
                with open(summary_path, 'w') as f:
                    f.write(description + '\n')
            else:
                raise RuntimeError(f"LLM command returned no output for {dirname}")
        else:
            print("*No README.md found - add one to have this project included in automated summaries.*")

        print()  # Add blank line between entries

]]]-->
*No research projects yet. Create a new directory at the root level to start your first research project!*
<!--[[[end]]]-->

---

## Updating the Research Projects List

This README uses [cogapp](https://nedbatchelder.com/code/cog/) to automatically generate research project descriptions.

### Automatic updates

A GitHub Action automatically runs `cog -r -P README.md` on every push to main and commits any changes to the README or new `_summary.md` files.

### Manual updates

To update locally:

```bash
# Install dependencies (Python 3.11+ recommended)
pip install -r requirements.txt

# Run cogapp to regenerate the project list
cog -r -P README.md
```

The script automatically:
- Discovers all top-level directories (excluding apps, packages, etc.)
- Gets the first commit date for each directory and sorts by most recent first
- For each directory, checks if a `_summary.md` file exists
- If the summary exists, it uses the cached version
- If not, it generates a new summary using `llm -m github/gpt-4.1` with a prompt that creates engaging descriptions
- Creates markdown links to each project folder on GitHub
- New summaries are saved to `_summary.md` to avoid regenerating them on every run

To regenerate a specific project's description, delete its `_summary.md` file and run `cog -r -P README.md` again.

