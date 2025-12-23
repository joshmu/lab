# Research Project Architecture Notes

## Date: 2025-11-11

### Goal
Understand and integrate the architecture patterns from Simon Willison's research repository into the Lab monorepo.

### Investigation Steps

1. **Analyzed simonw/research repository structure**
   - Repository: https://github.com/simonw/research
   - Blog post: https://simonwillison.net/2025/Nov/6/async-code-research/
   
2. **Key findings:**
   - Each research project is a top-level directory
   - Standard structure: README.md, notes.md, code files
   - AGENTS.md provides workflow guidelines for AI agents
   - CLAUDE.md symlinks to AGENTS.md for compatibility
   - GitHub Actions automates README generation using cogapp
   - Uses llm CLI tool for generating summaries
   
3. **Architectural Patterns Adopted:**
   - **Flat structure**: Research projects at root level (not nested)
   - **Self-contained**: Each project has its own README, notes, and code
   - **Automated documentation**: cogapp generates project summaries
   - **AI-friendly**: Clear guidelines in AGENTS.md
   - **Version controlled**: Git tracks all research iterations

4. **Implementation:**
   - Created AGENTS.md with comprehensive guidelines
   - Set up CLAUDE.md as symlink to AGENTS.md
   - Added GitHub Action workflow: `.github/workflows/update-readme.yml`
   - Created requirements.txt with cogapp, llm, llm-github-models
   - Updated README.md with cogapp templates for auto-generation

5. **Benefits:**
   - Clear separation between monorepo code and research
   - Easy to share individual research projects
   - Automated documentation reduces maintenance
   - AI agents have clear workflows to follow
   - Compatible with both Claude and Copilot

### Challenges Encountered
- None - straightforward integration

### Key Learnings
- cogapp is a powerful code generation tool for maintaining documentation
- Symlinks work well for aliasing documentation files
- Flat directory structure is better for independent research than nested structures
- Automated summaries using LLMs can save significant time

### References
- cogapp documentation: https://nedbatchelder.com/code/cog/
- llm CLI tool: https://llm.datasette.io/
- Simon Willison's blog: https://simonwillison.net/
