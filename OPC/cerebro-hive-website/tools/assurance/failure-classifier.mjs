/**
 * tools/assurance/failure-classifier.mjs
 *
 * Maps raw control execution errors to typed failure classes.
 *
 * Instead of a bare "FAILED", every failure has a machine-readable class that
 * routes it to the right owner:
 *
 *   ARCHITECTURE_FAILURE   → Reopen the relevant ADR. The control itself is broken.
 *   ENVIRONMENT_FAILURE    → Ops alert. CI environment is missing a required tool or
 *                            credential. The control is correct; the environment isn't.
 *   INFRASTRUCTURE_FAILURE → Infra on-call. A cluster, database, or external service
 *                            that the control depends on is unavailable.
 *   CONFIGURATION_FAILURE  → Config review. A required env var, secret, or config
 *                            file is absent or malformed.
 *   RUNNER_FAILURE         → Assurance team. The runner itself errored — a bug in
 *                            tools/assurance/runner.mjs or its dependencies.
 *   DEPENDENCY_FAILURE     → Blocked by another control that must pass first. Not an
 *                            error in this control.
 *   TIMEOUT                → The control exceeded its declared timeout_ms.
 *   BLOCKED                → A dependency declared in dependsOn[] failed or is UNKNOWN.
 *
 * The classifier uses a priority-ordered rule chain. Rules are checked in order;
 * the first match wins.
 */

/** @type {readonly string[]} */
export const FAILURE_CLASSES = Object.freeze([
  'ARCHITECTURE_FAILURE',
  'ENVIRONMENT_FAILURE',
  'INFRASTRUCTURE_FAILURE',
  'CONFIGURATION_FAILURE',
  'RUNNER_FAILURE',
  'DEPENDENCY_FAILURE',
  'TIMEOUT',
  'BLOCKED',
]);

/**
 * @typedef {object} ClassificationRule
 * @property {string}              failureClass
 * @property {string}              description
 * @property {(ctx: FailureContext) => boolean} match
 */

/**
 * @typedef {object} FailureContext
 * @property {string}            controlId
 * @property {string}            runnerType      — runner.type from descriptor
 * @property {Error|null}        error           — raw error thrown by runner
 * @property {string|null}       stderr          — captured stderr from subprocess
 * @property {number|null}       exitCode        — subprocess exit code
 * @property {boolean}           timedOut
 * @property {boolean}           dependencyFailed — a dependsOn control failed
 * @property {string[]}          missingFiles    — files checked but not found
 * @property {string[]}          missingEnvVars  — env vars checked but absent
 * @property {string[]}          missingTools    — CLI tools checked but not in PATH
 * @property {string|null}       rawOutput       — combined stdout + stderr
 */

/** @type {ClassificationRule[]} */
const RULES = [
  {
    failureClass: 'BLOCKED',
    description: 'A declared dependency failed or produced UNKNOWN evidence.',
    match: (ctx) => ctx.dependencyFailed,
  },
  {
    failureClass: 'TIMEOUT',
    description: 'Control execution exceeded the declared timeout_ms.',
    match: (ctx) => ctx.timedOut,
  },
  {
    failureClass: 'RUNNER_FAILURE',
    description: 'The runner itself threw an unexpected error (not a control failure).',
    match: (ctx) => {
      if (!ctx.error) return false;
      const msg = ctx.error.message ?? '';
      return (
        msg.includes('Cannot find module') ||
        msg.includes('SyntaxError') ||
        msg.includes('runner internal error') ||
        msg.includes('unexpected token') ||
        ctx.error.name === 'TypeError' && msg.includes('runner')
      );
    },
  },
  {
    failureClass: 'ENVIRONMENT_FAILURE',
    description: 'A required CLI tool is not in PATH.',
    match: (ctx) => ctx.missingTools.length > 0,
  },
  {
    failureClass: 'CONFIGURATION_FAILURE',
    description: 'A required env var or secret is absent or malformed.',
    match: (ctx) => {
      if (ctx.missingEnvVars.length > 0) return true;
      const output = (ctx.rawOutput ?? '').toLowerCase();
      return (
        output.includes('missing environment variable') ||
        output.includes('env var not set') ||
        output.includes('secret not found') ||
        output.includes('credentials not configured')
      );
    },
  },
  {
    failureClass: 'INFRASTRUCTURE_FAILURE',
    description: 'A cluster, database, or external service that the control depends on is unavailable.',
    match: (ctx) => {
      const output = (ctx.rawOutput ?? '').toLowerCase();
      const err = (ctx.error?.message ?? '').toLowerCase();
      return (
        output.includes('connection refused') ||
        output.includes('dial tcp') ||
        output.includes('econnrefused') ||
        output.includes('no such host') ||
        output.includes('cluster unreachable') ||
        output.includes('context deadline exceeded') ||
        err.includes('econnrefused') ||
        err.includes('etimedout')
      );
    },
  },
  {
    failureClass: 'ARCHITECTURE_FAILURE',
    description: 'The control found a real architectural problem — the system does not meet the requirement.',
    match: (_ctx) => true, // catch-all for genuine control failures
  },
];

/**
 * Classify a control execution failure into a typed failure class.
 *
 * @param {FailureContext} ctx
 * @returns {{ failureClass: string, reason: string }}
 */
export function classify(ctx) {
  for (const rule of RULES) {
    if (rule.match(ctx)) {
      return {
        failureClass: rule.failureClass,
        reason: rule.description,
      };
    }
  }
  // Should never reach here because ARCHITECTURE_FAILURE is the catch-all
  return { failureClass: 'ARCHITECTURE_FAILURE', reason: 'Unclassified failure.' };
}

/**
 * Build a FailureContext from a subprocess result.
 *
 * @param {object} params
 * @param {string}       params.controlId
 * @param {string}       params.runnerType
 * @param {Error|null}   [params.error]
 * @param {string|null}  [params.stdout]
 * @param {string|null}  [params.stderr]
 * @param {number|null}  [params.exitCode]
 * @param {boolean}      [params.timedOut]
 * @param {boolean}      [params.dependencyFailed]
 * @param {string[]}     [params.missingFiles]
 * @param {string[]}     [params.missingEnvVars]
 * @param {string[]}     [params.missingTools]
 * @returns {FailureContext}
 */
export function buildContext({
  controlId,
  runnerType,
  error = null,
  stdout = null,
  stderr = null,
  exitCode = null,
  timedOut = false,
  dependencyFailed = false,
  missingFiles = [],
  missingEnvVars = [],
  missingTools = [],
}) {
  return {
    controlId,
    runnerType,
    error,
    stderr,
    exitCode,
    timedOut,
    dependencyFailed,
    missingFiles,
    missingEnvVars,
    missingTools,
    rawOutput: [stdout, stderr].filter(Boolean).join('\n'),
  };
}
