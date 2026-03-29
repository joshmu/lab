import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "src/app/**/page.tsx",
    "src/app/**/layout.tsx",
    "src/app/**/route.ts",
    "src/experiments/**/index.tsx",
    "src/experiments/**/meta.ts",
    "src/experiments/registry.ts",
  ],
  project: ["src/**/*.{ts,tsx}"],
  ignoreDependencies: ["tw-animate-css", "tailwindcss", "postcss"],
};

export default config;
