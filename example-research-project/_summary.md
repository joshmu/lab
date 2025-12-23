This example project demonstrates the integration of Simon Willison's research repository architecture into the Lab monorepo, enabling AI-driven research projects to coexist with the Turborepo workspace. The architecture provides flat directory structure for research projects, AGENTS.md workflow guidelines, automated documentation generation via cogapp, and GitHub Actions automation for README updates. Key benefits include clear separation between monorepo code and research, self-contained projects, and AI-friendly workflows compatible with both Claude Code and GitHub Copilot. See [AGENTS.md](./AGENTS.md) for complete workflow guidelines and [cogapp](https://nedbatchelder.com/code/cog/) for documentation automation details.

**Key features:**
- Flat directory structure for independent research projects
- AGENTS.md provides comprehensive AI agent guidelines
- CLAUDE.md symlinks to AGENTS.md for compatibility
- GitHub Actions workflow for automated README generation
- Graceful fallback when LLM tools aren't available
