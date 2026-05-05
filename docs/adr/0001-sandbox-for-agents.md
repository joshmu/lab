# Sandbox for agents, not humans

The primary author of new experiments in this repo is an AI agent, not a human. Architectural decisions optimise for that audience: one-verb workflows (`pnpm experiment:new`, `pnpm experiment:check`), conventions written down in `src/experiments/AGENTS.md` rather than discovered by example, strict validation that fails loudly instead of silently dropping malformed input, and isolation of per-experiment helpers from sandbox infrastructure.

This is the load-bearing reason behind several specific choices: the scaffolder, the strict meta validator (replacing the previous regex extractor), draft preview in dev, the `src/experiments/_shared/` convention for cross-experiment helpers, and the registry-as-gitignored-build-artefact pattern. Future architecture reviews should re-evaluate from this lens — _what does an agent author need?_ — before considering "code quality of the things inside."
