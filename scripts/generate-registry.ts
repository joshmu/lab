/**
 * Registry Generator Script
 *
 * Scans the src/experiments directory for experiment definitions
 * and generates a registry file that can be imported at build time.
 *
 * Each experiment folder should have:
 * - index.tsx: The experiment component (default export)
 * - meta.ts: Metadata export (named export: meta)
 */

import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPERIMENTS_DIR = path.join(__dirname, "../src/experiments");
const REGISTRY_OUTPUT = path.join(EXPERIMENTS_DIR, "registry.ts");

interface ExperimentMeta {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  status: "draft" | "published";
}

async function generateRegistry() {
  console.log("🔍 Scanning for experiments...");

  // Find all meta.ts files in experiment directories
  const metaFiles = await glob("*/meta.ts", {
    cwd: EXPERIMENTS_DIR,
    absolute: true,
  });

  if (metaFiles.length === 0) {
    console.log("📭 No experiments found. Creating empty registry.");
    const emptyRegistry = `// Auto-generated file - do not edit manually
// Run 'pnpm generate:registry' to regenerate

import type { RegistryEntry } from "@/lib/types";

export const registry: RegistryEntry[] = [];

export const experiments: Record<string, () => Promise<{ default: React.ComponentType }>> = {};
`;
    fs.writeFileSync(REGISTRY_OUTPUT, emptyRegistry);
    console.log("✅ Empty registry generated.");
    return;
  }

  const experiments: ExperimentMeta[] = [];
  const experimentImports: string[] = [];

  for (const metaFile of metaFiles) {
    const experimentDir = path.dirname(metaFile);
    const experimentName = path.basename(experimentDir);

    try {
      // Read and parse the meta file to extract metadata
      const metaContent = fs.readFileSync(metaFile, "utf-8");

      // Simple extraction of meta object from the file
      // This is a basic parser - in production you might want to use AST parsing
      const meta = extractMetaFromContent(metaContent, experimentName);

      if (meta) {
        experiments.push(meta);
        experimentImports.push(
          `  "${meta.slug}": () => import("./${experimentName}")`
        );
        console.log(`  ✓ Found: ${meta.title} (${meta.slug})`);
      }
    } catch (error) {
      console.error(`  ✗ Error processing ${experimentName}:`, error);
    }
  }

  // Sort experiments by creation date (newest first)
  experiments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Generate the registry file
  const registryContent = `// Auto-generated file - do not edit manually
// Run 'pnpm generate:registry' to regenerate

import type { RegistryEntry } from "@/lib/types";
import type { ComponentType } from "react";

export const registry: RegistryEntry[] = ${JSON.stringify(experiments, null, 2)};

export const experiments: Record<string, () => Promise<{ default: ComponentType }>> = {
${experimentImports.join(",\n")}
};
`;

  fs.writeFileSync(REGISTRY_OUTPUT, registryContent);

  console.log(`\n✅ Registry generated with ${experiments.length} experiment(s)`);
  console.log(`   Output: ${REGISTRY_OUTPUT}`);
}

/**
 * Extract metadata from a meta.ts file content
 * This is a simple regex-based extractor
 */
function extractMetaFromContent(
  content: string,
  fallbackSlug: string
): ExperimentMeta | null {
  try {
    // Extract the meta object using regex
    const slugMatch = content.match(/slug:\s*["']([^"']+)["']/);
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    const descriptionMatch = content.match(/description:\s*["']([^"']+)["']/);
    const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/);
    const createdAtMatch = content.match(/createdAt:\s*["']([^"']+)["']/);
    const updatedAtMatch = content.match(/updatedAt:\s*["']([^"']+)["']/);
    const statusMatch = content.match(/status:\s*["']([^"']+)["']/);

    if (!titleMatch || !descriptionMatch) {
      console.warn(`  ⚠ Missing required fields in ${fallbackSlug}`);
      return null;
    }

    const tags = tagsMatch
      ? tagsMatch[1]
          .split(",")
          .map((t) => t.trim().replace(/["']/g, ""))
          .filter(Boolean)
      : [];

    return {
      slug: slugMatch ? slugMatch[1] : fallbackSlug,
      title: titleMatch[1],
      description: descriptionMatch[1],
      tags,
      createdAt: createdAtMatch ? createdAtMatch[1] : new Date().toISOString(),
      updatedAt: updatedAtMatch ? updatedAtMatch[1] : undefined,
      status: (statusMatch?.[1] as "draft" | "published") || "draft",
    };
  } catch {
    return null;
  }
}

generateRegistry().catch(console.error);
