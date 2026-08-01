/**
 * CerebroEDA architecture boundaries.
 *
 * Each rule below encodes a specific ADR. The `comment` field names the ADR so a
 * developer hitting the failure can read the reasoning rather than guessing —
 * and so that anyone proposing to relax a rule has to argue with the decision,
 * not with a config file.
 *
 * Merged into the root config by `.dependency-cruiser.js`.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    // -----------------------------------------------------------------------
    // ADR 0009 (D4) — Temporal containment
    // -----------------------------------------------------------------------
    {
      name: 'eda-temporal-containment',
      severity: 'error',
      comment:
        'ADR 0009: only packages/eda-workflow may import @temporalio/*. The façade is what ' +
        'bounds the exit cost of the Temporal dependency. Import @cerebro/eda-workflow instead.',
      from: { pathNot: '^packages/eda-workflow/' },
      to: { path: 'node_modules/@temporalio' },
    },
    {
      name: 'eda-no-workflow-engine-in-domain',
      severity: 'error',
      comment:
        'ADR 0009: eda-domain is pure. Orchestration concerns must not leak into domain primitives.',
      from: { path: '^packages/eda-domain/' },
      to: { path: '^packages/eda-workflow/' },
    },

    // -----------------------------------------------------------------------
    // ADR 0010 (D7) — tenancy
    // -----------------------------------------------------------------------
    {
      name: 'eda-db-access-via-tenancy-only',
      severity: 'error',
      comment:
        'ADR 0010: raw database clients may only be used by eda-tenancy, which sets ' +
        'app.current_org inside the transaction. Every other package must go through ' +
        'TenantScopedTransaction so RLS is always engaged.',
      from: { path: '^(packages|services)/eda-', pathNot: '^packages/eda-tenancy/' },
      to: { path: 'node_modules/(pg|postgres|mysql2|knex)(/|$)' },
    },

    // -----------------------------------------------------------------------
    // ADR 0012 (D1) — graph store isolation
    // -----------------------------------------------------------------------
    {
      name: 'eda-graph-sql-containment',
      severity: 'error',
      comment:
        'ADR 0012: no service may query graph_nodes/graph_edges directly. The knowledge-service ' +
        'API boundary is what makes the Postgres→native-graph migration a contained change.',
      from: { path: '^(packages|services)/eda-', pathNot: '^packages/eda-knowledge/' },
      to: { path: '^packages/eda-knowledge/src/internal/' },
    },

    // -----------------------------------------------------------------------
    // ADR 0011 (D9) — signature computation
    // -----------------------------------------------------------------------
    {
      name: 'eda-signature-single-implementation',
      severity: 'error',
      comment:
        'ADR 0011: signature hashing has exactly one implementation, in eda-findings. ' +
        'A second one could invent incompatible identity, which corrupts the cornerstone.',
      from: { path: '^(packages|services)/eda-', pathNot: '^packages/eda-findings/' },
      to: { path: '^packages/eda-findings/src/internal/hash' },
    },

    // -----------------------------------------------------------------------
    // ADR 0003 — observability facade
    // -----------------------------------------------------------------------
    {
      name: 'eda-otel-containment',
      severity: 'error',
      comment: 'ADR 0003: only eda-observability may import @opentelemetry/*.',
      from: { pathNot: '^packages/eda-observability/' },
      to: { path: 'node_modules/@opentelemetry' },
    },

    // -----------------------------------------------------------------------
    // Layering — domain ← platform ← capability ← service ← app
    // -----------------------------------------------------------------------
    {
      name: 'eda-domain-is-pure',
      severity: 'error',
      comment:
        'eda-domain holds value objects only. It must not depend on any other eda package, ' +
        'and must not perform I/O. Everything else may depend on it.',
      from: { path: '^packages/eda-domain/' },
      to: { path: '^packages/eda-(?!domain)' },
    },
    {
      name: 'eda-no-service-imports-from-package',
      severity: 'error',
      comment: 'Packages must not import from services. Dependencies point inward.',
      from: { path: '^packages/eda-' },
      to: { path: '^services/' },
    },
    {
      name: 'eda-no-cross-service-imports',
      severity: 'error',
      comment:
        'Services communicate by event or published API, never by importing each other ' +
        "(Blueprint §7.1 context map). Shared code belongs in a package.",
      from: { path: '^services/eda-([^/]+)/' },
      to: { path: '^services/eda-(?!\\1)([^/]+)/' },
    },
    {
      name: 'eda-ui-is-client-only',
      severity: 'error',
      comment:
        'ADR 0017: eda-ui is presentation. It must not import execution, workflow, tenancy ' +
        'or storage packages — those carry server credentials and privileged contracts.',
      from: { path: '^packages/eda-ui/' },
      to: { path: '^packages/eda-(execution|workflow|tenancy|storage|security)/' },
    },

    // -----------------------------------------------------------------------
    // General hygiene
    // -----------------------------------------------------------------------
    {
      name: 'eda-no-circular',
      severity: 'error',
      comment: 'Circular dependencies between eda packages indicate a missing boundary.',
      from: { path: '^packages/eda-' },
      to: { path: '^packages/eda-', circular: true },
    },
    {
      name: 'eda-no-orphans',
      severity: 'warn',
      comment: 'Dead package detection — an eda module nothing imports is either unfinished or waste.',
      from: { path: '^packages/eda-.*/src/', pathNot: '(index|.*\\.d)\\.ts$' },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: {
      path: ['node_modules', '\\.test\\.ts$', '\\.spec\\.ts$', 'dist/', 'build/', '\\.next/', 'src/generated/'],
    },
    moduleSystems: ['cjs', 'es6'],
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
  },
};
