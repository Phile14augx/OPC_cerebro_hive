/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Warns against any circular dependencies',
      from: {},
      to: { circular: true },
    },
    {
      name: 'infrastructure-cannot-depend-on-app',
      severity: 'error',
      comment: 'Infrastructure packages cannot depend on Applications',
      from: { path: '^packages/(core-bus|telemetry-core|domain-graph)' },
      to: { path: '^apps/' },
    },
    {
      name: 'kernel-cannot-depend-on-platform',
      severity: 'error',
      comment: 'Kernel packages cannot depend on Platform Services',
      from: { path: '^packages/(kernel-core|architecture-core)' },
      to: { path: '^packages/(ai-gateway|workflow|evaluation|trust-core)' },
    },
    {
      name: 'no-upward-layer-imports',
      severity: 'error',
      comment: 'Lower layers cannot import from higher layers',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled', 'npm-no-pkg'],
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    }
  }
};
