# Lab

A sandbox for agents to drop single-page ideas into. The sandbox handles registration, routing, validation, and discovery, so the experiment author (typically an AI agent) can focus on the idea itself. Per [ADR-0001](./docs/adr/0001-sandbox-for-agents.md), all architectural choices are evaluated from the agent-author's perspective first.

## Language

**Sandbox**:
This repo as a whole. Its job is to make adding a self-contained interactive page as cheap as possible — one command to scaffold, automatic discovery, strict validation at the seam. Architectural choices that make the sandbox cheaper for agents take precedence over choices that polish the things inside it.
_Avoid_: framework, platform, monorepo

**Experiment**:
A self-contained interactive page living in `src/experiments/<slug>/`, defined by an `index.tsx` (default-exported React component) and a `meta.ts`. The unit of work in this repo. Created via `pnpm experiment:new <slug>`.
_Avoid_: component, page, demo

**Meta**:
An experiment's authoring data — slug, title, description, tags, dates, status (`"published"` or `"draft"`). The single source of truth. Validated strictly at build time; invalid metas fail the build with a precise message.
_Avoid_: manifest, config, frontmatter

**Registry**:
The discovered list of all experiments. A build artefact derived from each experiment's `meta.ts` by `scripts/generate-registry.ts`. Regenerated on every `pnpm dev`, `pnpm build`, `pnpm validate`, and in CI. Never hand-edited or committed.
_Avoid_: index, catalogue, directory

## Relationships

- The **Sandbox** contains zero-or-more **Experiments**.
- An **Experiment** has exactly one **Meta**.
- The **Registry** is the **Sandbox**'s discovery surface — it lists every **Experiment** found under `src/experiments/`.
- The homepage shows only **Experiments** whose **Meta** has `status: "published"`. Drafts are accessible directly at `/experiments/<slug>` in dev only.

## Example dialogue

> **Agent:** "I want to add a colour-picker idea."
> **Sandbox:** "Run `pnpm experiment:new colour-picker`. It creates the folder, a draft **Meta**, and a starter `index.tsx`. Edit, preview at `/experiments/colour-picker` (drafts work in dev), then `pnpm experiment:check colour-picker` before flipping status to `"published"`."
