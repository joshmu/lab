import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import { pathToFileURL } from "url";
import type { ExperimentMeta } from "../src/lib/types";

export class MetaValidationError extends Error {
  constructor(slug: string, problems: string[]) {
    super(
      `Invalid meta for experiment "${slug}":\n${problems.map((p) => `  - ${p}`).join("\n")}`
    );
    this.name = "MetaValidationError";
  }
}

export class ExperimentDiscoveryError extends Error {}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T.*)?$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function validate(
  value: unknown,
  folderSlug: string
): { ok: true; meta: ExperimentMeta } | { ok: false; problems: string[] } {
  const problems: string[] = [];
  if (typeof value !== "object" || value === null) {
    return { ok: false, problems: ["meta export must be an object"] };
  }
  const m = value as Record<string, unknown>;

  if (typeof m.slug !== "string" || !SLUG_RE.test(m.slug)) {
    problems.push(`slug must be kebab-case (got ${JSON.stringify(m.slug)})`);
  } else if (m.slug !== folderSlug) {
    problems.push(`slug "${m.slug}" must match folder name "${folderSlug}"`);
  }
  if (typeof m.title !== "string" || m.title.length === 0) {
    problems.push("title must be a non-empty string");
  }
  if (typeof m.description !== "string" || m.description.length === 0) {
    problems.push("description must be a non-empty string");
  }
  if (
    !Array.isArray(m.tags) ||
    !m.tags.every((t) => typeof t === "string" && t.length > 0)
  ) {
    problems.push("tags must be an array of non-empty strings");
  }
  if (typeof m.createdAt !== "string" || !ISO_DATE_RE.test(m.createdAt)) {
    problems.push("createdAt must be an ISO date string (YYYY-MM-DD)");
  }
  if (
    m.updatedAt !== undefined &&
    (typeof m.updatedAt !== "string" || !ISO_DATE_RE.test(m.updatedAt))
  ) {
    problems.push("updatedAt, if present, must be an ISO date string");
  }
  if (m.status !== "draft" && m.status !== "published") {
    problems.push('status must be "draft" or "published"');
  }

  if (problems.length > 0) return { ok: false, problems };
  return { ok: true, meta: m as unknown as ExperimentMeta };
}

export async function loadMeta(metaPath: string): Promise<ExperimentMeta> {
  const folderSlug = path.basename(path.dirname(metaPath));
  if (!fs.existsSync(metaPath)) {
    throw new ExperimentDiscoveryError(`meta.ts not found at ${metaPath}`);
  }
  const mod = await import(pathToFileURL(metaPath).href);
  const result = validate(mod.meta, folderSlug);
  if (!result.ok) {
    throw new MetaValidationError(folderSlug, result.problems);
  }
  return result.meta;
}

export async function discoverExperiments(
  experimentsDir: string
): Promise<ExperimentMeta[]> {
  const metaFiles = await glob("*/meta.ts", {
    cwd: experimentsDir,
    absolute: true,
  });

  const metas: ExperimentMeta[] = [];
  for (const metaFile of metaFiles) {
    metas.push(await loadMeta(metaFile));
  }

  const slugs = new Set<string>();
  for (const m of metas) {
    if (slugs.has(m.slug)) {
      throw new ExperimentDiscoveryError(
        `Duplicate slug "${m.slug}" — every experiment folder needs a unique name`
      );
    }
    slugs.add(m.slug);
  }

  metas.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return metas;
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}
