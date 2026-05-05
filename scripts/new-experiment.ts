import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { isValidSlug } from "./registry-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPERIMENTS_DIR = path.join(__dirname, "../src/experiments");

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

const slug = process.argv[2];
if (!slug) {
  fail("Usage: pnpm experiment:new <slug>");
}
if (!isValidSlug(slug)) {
  fail(
    `Invalid slug "${slug}". Use kebab-case: lowercase letters, digits, and hyphens (e.g. "my-experiment").`
  );
}

const experimentDir = path.join(EXPERIMENTS_DIR, slug);
if (fs.existsSync(experimentDir)) {
  fail(`Folder already exists: src/experiments/${slug}/`);
}

const today = new Date().toISOString().slice(0, 10);

const titleFromSlug = slug
  .split("-")
  .map((w) => w[0].toUpperCase() + w.slice(1))
  .join(" ");

const meta = `import type { ExperimentMeta } from "@/lib/types";

export const meta: ExperimentMeta = {
  slug: "${slug}",
  title: "${titleFromSlug}",
  description: "TODO: one-sentence description of what this experiment shows",
  tags: [],
  createdAt: "${today}",
  status: "draft",
};
`;

const componentName =
  slug
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("") + "Experiment";

const index = `"use client";

export default function ${componentName}() {
  return (
    <div>
      <h2 className="text-xl font-bold">${titleFromSlug}</h2>
      <p className="text-muted-foreground mt-2">
        Replace this with your experiment.
      </p>
    </div>
  );
}
`;

fs.mkdirSync(experimentDir);
fs.writeFileSync(path.join(experimentDir, "meta.ts"), meta);
fs.writeFileSync(path.join(experimentDir, "index.tsx"), index);

console.log(`Created src/experiments/${slug}/`);
console.log(`  meta.ts (status: "draft")`);
console.log(`  index.tsx`);
console.log("");
console.log("Next:");
console.log(`  - edit src/experiments/${slug}/index.tsx`);
console.log(`  - preview at /experiments/${slug} (drafts work in dev)`);
console.log(`  - run \`pnpm experiment:check ${slug}\` before claiming done`);
console.log(`  - flip status to "published" when ready`);
