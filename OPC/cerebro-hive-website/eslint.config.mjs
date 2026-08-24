import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ESLint v9 flat config for the root-level Next.js app (app/, components/, lib/).
//
// Context: the root package is NOT a pnpm workspace package (not declared in
// pnpm-workspace.yaml), so `turbo lint` never runs against it. This config is
// used by the explicit `lint:root` / `pnpm exec eslint .` step in ci.yml and
// matches the pattern used by apps/studio and apps/platform.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      ".dependency-cruiser.js",
      "fix.js",
      "scratch/fix_workflows.js",
      "tooling/eslint-plugin-design-system/src/index.js",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/exhaustive-deps": "off",
      "import/no-anonymous-default-export": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Turborepo workspace packages have their own configs — don't double-lint them.
    "apps/**",
    "packages/**",
    "services/**",
    "infra/**",
    "tools/**",
    "scripts/**",
    "node_modules/**",
  ]),
]);

export default eslintConfig;


