/**
 * Gate A workload definitions — ADR 0013 (D2).
 *
 * These are deliberately NOT generic container benchmarks. Published gVisor
 * numbers measure web-server and microservice profiles; EDA tools have a
 * different shape — long-lived processes doing heavy sequential file I/O over
 * large trees, with occasional metadata storms. Measuring the wrong profile is
 * how a decision gets confidently made on irrelevant evidence.
 *
 * Each workload isolates one axis so a failure is attributable. A single
 * end-to-end number tells you the sandbox is slow but not which syscall class
 * to blame.
 */

export const WORKLOADS = [
  {
    id: 'startup',
    title: 'Process startup latency',
    axis: 'startup',
    description:
      'Minimal process spawn and exit. Isolates sandbox initialisation cost — the ' +
      'component that dominates a regression sweep of 10,000 short simulations.',
    // Deliberately trivial: anything else contaminates the measurement.
    command: ['/bin/sh', '-c', 'exit 0'],
    prepare: null,
    producesArtifacts: false,
  },

  {
    id: 'hdl_parse_large',
    title: 'Large HDL parse',
    axis: 'cpu+read',
    description:
      'Tokenise and structurally index a synthetic RTL tree. CPU-bound with ' +
      'sequential reads — the profile of the parser and RTL-index workers.',
    command: ['node', '/work/bench/parse-hdl.mjs', '/work/corpus/rtl'],
    prepare: 'corpus:rtl',
    producesArtifacts: true,
  },

  {
    id: 'lint_tool',
    title: 'Lint tool execution',
    axis: 'cpu+read+write',
    description:
      'Rule evaluation over the RTL corpus with findings written out. Stands in ' +
      'for the typical per-commit engineering workload.',
    command: ['node', '/work/bench/lint.mjs', '/work/corpus/rtl', '/work/out/lint.json'],
    prepare: 'corpus:rtl',
    producesArtifacts: true,
  },

  {
    id: 'file_tree_traversal',
    title: 'Massive file tree traversal',
    axis: 'metadata',
    description:
      'stat() every entry in a wide, deep tree. Pure metadata syscall stress — ' +
      'the theoretical worst case for a userspace kernel, and common in real ' +
      'flows (filelist resolution, incremental hashing, scratch cleanup).',
    command: ['node', '/work/bench/traverse.mjs', '/work/corpus/tree'],
    prepare: 'corpus:tree',
    producesArtifacts: false,
  },

  {
    id: 'mixed_parse_write',
    title: 'Mixed parse and artifact write',
    axis: 'end-to-end',
    description:
      'Read inputs, parse, hash, write artifacts. The closest proxy for a real ' +
      'job and the headline number for the gate.',
    command: ['node', '/work/bench/mixed.mjs', '/work/corpus/rtl', '/work/out/artifacts'],
    prepare: 'corpus:rtl',
    producesArtifacts: true,
  },
];

/**
 * Corpus sizes.
 *
 * Scaled so each workload runs 2–20s natively: long enough that timer resolution
 * and startup noise do not dominate, short enough that 25 iterations x 3 runtimes
 * x 5 workloads completes in a coffee break rather than overnight. A benchmark
 * nobody reruns is a benchmark that goes stale.
 */
export const CORPUS = {
  rtl: {
    modules: 2000,
    linesPerModule: 400,
    $comment: '~800k lines — comparable to a mid-size SoC block.',
  },
  tree: {
    dirs: 5000,
    filesPerDir: 20,
    depth: 4,
    $comment: '~100k files. Real scratch directories reach this routinely.',
  },
};
