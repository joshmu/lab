# Lab

A sandbox repository for web development experiments. Each experiment is a self-contained interactive page that gets discovered automatically and listed on the homepage.

## Language

**Experiment**:
A self-contained interactive page living in `src/experiments/<slug>/`, defined by an `index.tsx` (default-exported React component) and a `meta.ts`. The unit of work in this repo — adding a new one is the primary authoring action.
_Avoid_: component, page, demo

**Meta**:
An experiment's authoring data — slug, title, description, tags, dates, status (`"published"` or `"draft"`). The single source of truth for everything the registry knows about an experiment.
_Avoid_: manifest, config, frontmatter

**Registry**:
The discovered list of all experiments. A build artefact derived from each experiment's `meta.ts` by `scripts/generate-registry.ts`. Regenerated on every `pnpm dev`, `pnpm build`, `pnpm validate`, and in CI. Never hand-edited or committed.
_Avoid_: index, catalogue, directory

## Relationships

- An **Experiment** has exactly one **Meta**.
- The **Registry** contains every **Experiment** discovered under `src/experiments/`.
- The homepage shows only **Experiments** whose **Meta** has `status: "published"`.

## Example dialogue

> **Dev:** "I added a new **Experiment** but it's not showing up on the homepage."
> **Maintainer:** "Did you set `status: "published"` in its **Meta**? And the **Registry** regenerates on `pnpm dev` — if you added the folder mid-session, restart the dev server."
