import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  discoverExperiments,
  MetaValidationError,
  ExperimentDiscoveryError,
} from "./registry-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPERIMENTS_DIR = path.join(__dirname, "../src/experiments");
const REGISTRY_OUTPUT = path.join(EXPERIMENTS_DIR, "registry.ts");

async function main() {
  const experiments = await discoverExperiments(EXPERIMENTS_DIR);

  const imports = experiments
    .map((m) => `  "${m.slug}": () => import("./${m.slug}")`)
    .join(",\n");

  const content = `// Auto-generated build artefact - do not edit, do not commit.
// Regenerated on \`pnpm dev\`, \`pnpm build\`, \`pnpm validate\`, and in CI.

import type { RegistryEntry } from "@/lib/types";
import type { ComponentType } from "react";

export const registry: RegistryEntry[] = ${JSON.stringify(experiments, null, 2)};

export const experiments: Record<string, () => Promise<{ default: ComponentType }>> = {
${imports}
};
`;

  fs.writeFileSync(REGISTRY_OUTPUT, content);
  console.log(
    `Registry generated: ${experiments.length} experiment(s) → ${path.relative(process.cwd(), REGISTRY_OUTPUT)}`
  );
}

main().catch((err) => {
  if (
    err instanceof MetaValidationError ||
    err instanceof ExperimentDiscoveryError
  ) {
    console.error(`\n${err.message}\n`);
    process.exit(1);
  }
  throw err;
});
