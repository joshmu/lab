import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "src/app/**/page.tsx",
    "src/app/**/layout.tsx",
    "src/app/**/route.ts",
    "src/experiments/**/index.tsx",
    "src/experiments/**/meta.ts",
    "scripts/generate-registry.ts",
  ],
  project: ["src/**/*.{ts,tsx}"],
  ignore: ["src/experiments/registry.ts"],
  ignoreDependencies: [
    "tw-animate-css",
    "@tailwindcss/postcss",
    "@testing-library/dom",
    "tailwindcss",
  ],
};

export default config;
