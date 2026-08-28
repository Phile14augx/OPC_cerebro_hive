import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const artifactIgnores = [
  "build/**",
  "coverage/**",
  "dist/**",
  "node_modules/**",
  "src/**/__tests__/**",
  "src/**/*.test.{ts,tsx}",
  "src/**/*.spec.{ts,tsx}",
];

/** Creates the ESLint 9 flat configuration for source-bearing TS workspaces. */
export function defineTypeScriptWorkspace({ tsconfigRootDir, project = "./tsconfig.json", eda = false } = {}) {
  if (!tsconfigRootDir) throw new Error("defineTypeScriptWorkspace requires tsconfigRootDir");

  return [{ ignores: artifactIgnores }, {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project, tsconfigRootDir },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      ...(eda ? {
        "no-restricted-imports": ["error", { paths: [
          { name: "@temporalio/client", message: "ADR 0009: import @cerebro/eda-workflow." },
          { name: "@temporalio/workflow", message: "ADR 0009: import @cerebro/eda-workflow." },
          { name: "pg", message: "ADR 0010: use TenantScopedTransaction from @cerebro/eda-tenancy." },
        ] }],
      } : {}),
    },
  }];
}
