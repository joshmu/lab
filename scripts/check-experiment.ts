import * as fs from "fs";
import * as path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { loadMeta, isValidSlug, MetaValidationError } from "./registry-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXPERIMENTS_DIR = path.join(__dirname, "../src/experiments");

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function main() {
  const slug = process.argv[2];
  if (!slug) fail("Usage: pnpm experiment:check <slug>");
  if (!isValidSlug(slug)) fail(`Invalid slug "${slug}" (must be kebab-case)`);

  const dir = path.join(EXPERIMENTS_DIR, slug);
  if (!fs.existsSync(dir)) fail(`Folder not found: src/experiments/${slug}/`);

  const metaPath = path.join(dir, "meta.ts");
  const indexPath = path.join(dir, "index.tsx");
  if (!fs.existsSync(metaPath)) fail(`Missing src/experiments/${slug}/meta.ts`);
  if (!fs.existsSync(indexPath))
    fail(`Missing src/experiments/${slug}/index.tsx`);

  const meta = await loadMeta(metaPath);

  const indexSource = fs.readFileSync(indexPath, "utf-8");
  if (!/export\s+default\s+/.test(indexSource)) {
    fail(
      `src/experiments/${slug}/index.tsx must have a default export (the React component)`
    );
  }

  // Light dynamic-import sanity check — esbuild via tsx will surface syntax errors.
  // We import meta only (importing the .tsx component pulls in React + browser APIs).
  await import(pathToFileURL(metaPath).href);

  console.log(`OK: ${slug}`);
  console.log(`  status: ${meta.status}`);
  console.log(`  title:  ${meta.title}`);
  console.log(`  tags:   [${meta.tags.join(", ")}]`);
  if (meta.status === "draft") {
    console.log(
      `  preview: http://localhost:3000/experiments/${slug} (dev only)`
    );
  }
}

main().catch((err) => {
  if (err instanceof MetaValidationError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
});
