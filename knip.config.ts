import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "src/app/**/page.tsx",
    "src/app/**/layout.tsx",
    "src/app/**/route.ts",
    "src/experiments/**/index.tsx",
    "src/experiments/**/meta.ts",
    "src/experiments/**/*.{ts,tsx}",
    "src/lib/types.ts",
    "src/lib/github.ts",
    "postcss.config.mjs",
  ],
  project: ["src/**/*.{ts,tsx}"],
  ignore: ["src/experiments/registry.ts", "src/components/ui/**"],
  ignoreDependencies: [
    "tw-animate-css",
    "tailwindcss",
    "@testing-library/dom",
    "@testing-library/react",
    "postcss",
  ],
};

export default config;
