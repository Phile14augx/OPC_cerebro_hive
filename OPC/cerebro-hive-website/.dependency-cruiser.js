/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-studio-to-forge-api",
      severity: "error",
      comment: "Studio must not import forge-api directly — use HTTP",
      from: { path: "apps/studio" },
      to: { path: "apps/forge-api" },
    },
    {
      name: "no-forge-to-platform-api-internals",
      severity: "error",
      comment: "Forge UI must communicate via HTTP, not import platform-api code",
      from: { path: "apps/forge" },
      to: { path: "apps/platform-api/src" },
    },
    {
      name: "no-ai-gateway-to-platform-api",
      severity: "error",
      comment: "AI Gateway is a pure router — must not depend on platform-api",
      from: { path: "packages/ai-gateway" },
      to: { path: "apps/platform-api" },
    },
    {
      name: "no-circular-package-deps",
      severity: "error",
      comment: "Packages must not have circular dependencies",
      from: { path: "^packages/" },
      to: { path: "^packages/", circular: true },
    },
    {
      name: "no-deprecated-packages",
      severity: "warn",
      from: {},
      to: { dependencyTypes: ["deprecated"] },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: {
      path: ["node_modules", "\\.test\\.ts$", "\\.spec\\.ts$", "dist/", "build/", ".next/", "src/generated/"],
    },
    moduleSystems: ["cjs", "es6"],
    tsPreCompilationDeps: true,
  },
};
