#!/usr/bin/env node
/**
 * Gate B — workflow history growth model (ADR 0009).
 *
 * THIS IS A MODEL, NOT A MEASUREMENT. It computes event budgets from documented
 * Temporal limits and stated assumptions. Its purpose is to answer, before we
 * stand up a cluster, whether the fan-out design in ADR 0009 §8.3 is even
 * arithmetically possible — and to produce a prediction that the real Gate B run
 * can then confirm or refute.
 *
 * A model that is never checked against measurement is just a confident opinion,
 * so every assumption below is named and overridable, and the output states
 * explicitly which numbers are assumed rather than observed.
 *
 * Usage: node history-model.mjs [--scales 10,100,1000,10000,50000]
 */

/**
 * Temporal limits. Documented defaults as of the 1.2x series.
 *
 * These are ASSUMPTIONS pending confirmation against the deployed cluster —
 * they are server-side configurable, and a self-hosted cluster may differ.
 * Gate B's first job on real infrastructure is to read the actual values.
 */
const TEMPORAL_LIMITS = {
  historyCountWarn: 10_240,
  historyCountTerminate: 51_200,
  historySizeWarnBytes: 10 * 1024 * 1024,
  historySizeTerminateBytes: 50 * 1024 * 1024,
  source: 'Temporal documented defaults — MUST be verified against the deployed cluster',
};

/**
 * Events generated per activity.
 *
 * A minimal activity produces ActivityTaskScheduled, ActivityTaskStarted and
 * ActivityTaskCompleted. Async completion (ADR 0009's model for long-running
 * jobs) adds no extra history events at completion time, but each heartbeat
 * *may* produce one depending on configuration.
 *
 * The workflow-task overhead is the part most often forgotten: every batch of
 * activity completions drives a WorkflowTaskScheduled/Started/Completed triple.
 * With low concurrency that approaches three extra events per activity.
 */
const EVENT_MODEL = {
  perActivityBase: 3,
  workflowTaskTriple: 3,
  /** Activity completions coalesced into one workflow task. Pessimistic default. */
  completionsPerWorkflowTask: 4,
  /** Bytes per event: input/output payloads dominate. Assumes compact refs, not blobs. */
  bytesPerEvent: 512,
};

const args = process.argv.slice(2);
const argOf = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const SCALES = argOf('--scales', '10,100,1000,10000,50000').split(',').map(Number);

function eventsFor(activities, model = EVENT_MODEL) {
  const activityEvents = activities * model.perActivityBase;
  const workflowTasks = Math.ceil(activities / model.completionsPerWorkflowTask);
  const workflowTaskEvents = workflowTasks * model.workflowTaskTriple;
  // Workflow start/complete bookends.
  const total = activityEvents + workflowTaskEvents + 5;
  return { activityEvents, workflowTaskEvents, total, bytes: total * model.bytesPerEvent };
}

/** Largest activity count that fits under the terminate limit, with headroom. */
function maxActivitiesPerWorkflow(headroom = 0.6) {
  const budget = TEMPORAL_LIMITS.historyCountTerminate * headroom;
  let lo = 1, hi = 100_000;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (eventsFor(mid).total <= budget) lo = mid; else hi = mid - 1;
  }
  return lo;
}

const rows = SCALES.map((n) => {
  const e = eventsFor(n);
  const pctOfTerminate = e.total / TEMPORAL_LIMITS.historyCountTerminate;
  let status;
  if (e.total >= TEMPORAL_LIMITS.historyCountTerminate) status = 'TERMINATES';
  else if (e.total >= TEMPORAL_LIMITS.historyCountWarn) status = 'warns';
  else status = 'ok';
  return { activities: n, ...e, pctOfTerminate, status };
});

const maxSingle = maxActivitiesPerWorkflow();

const fmt = (n) => n.toLocaleString('en-US');
const lines = [];
lines.push('# Gate B — Workflow History Growth Model (ADR 0009)');
lines.push('');
lines.push('> **MODEL, NOT MEASUREMENT.** Computed from documented Temporal defaults and the');
lines.push('> stated event model below. Produces a prediction for the real Gate B run to');
lines.push('> confirm or refute — it does not itself satisfy Gate B.');
lines.push('');
lines.push('## Assumptions');
lines.push('');
lines.push('| Assumption | Value | Confidence |');
lines.push('|---|---|---|');
lines.push(`| History count terminate limit | ${fmt(TEMPORAL_LIMITS.historyCountTerminate)} | documented default, unverified on our cluster |`);
lines.push(`| History count warn threshold | ${fmt(TEMPORAL_LIMITS.historyCountWarn)} | documented default, unverified |`);
lines.push(`| Events per activity (base) | ${String(EVENT_MODEL.perActivityBase)} | high — scheduled/started/completed is structural |`);
lines.push(`| Completions per workflow task | ${String(EVENT_MODEL.completionsPerWorkflowTask)} | LOW — depends on concurrency and poll timing |`);
lines.push(`| Bytes per event | ${String(EVENT_MODEL.bytesPerEvent)} | LOW — payload-dependent; assumes artifact refs not blobs |`);
lines.push('');
lines.push('The two low-confidence assumptions are the ones the real run must pin down.');
lines.push('');
lines.push('## Predicted history growth, single workflow');
lines.push('');
lines.push('| Activities | Activity events | Workflow-task events | Total events | % of terminate limit | Est. size | Status |');
lines.push('|---|---|---|---|---|---|---|');
for (const r of rows) {
  lines.push(
    `| ${fmt(r.activities)} | ${fmt(r.activityEvents)} | ${fmt(r.workflowTaskEvents)} | ${fmt(r.total)} | ` +
      `${(r.pctOfTerminate * 100).toFixed(1)}% | ${(r.bytes / 1024 / 1024).toFixed(1)} MiB | **${r.status}** |`,
  );
}
lines.push('');
lines.push('## Finding');
lines.push('');
lines.push(`Maximum activities in a single workflow, with 40% headroom: **${fmt(maxSingle)}**.`);
lines.push('');

const tenK = rows.find((r) => r.activities === 10_000);
const fiftyK = rows.find((r) => r.activities === 50_000);

if (fiftyK && fiftyK.status === 'TERMINATES') {
  lines.push(
    `A 50,000-activity regression **cannot run as one workflow** — the model puts it at ` +
      `${fmt(fiftyK.total)} events, ${(fiftyK.pctOfTerminate * 100).toFixed(0)}% of the terminate limit. ` +
      'Temporal would terminate the run mid-flight.',
  );
  lines.push('');
}
if (tenK && tenK.status !== 'ok') {
  lines.push(
    `Even 10,000 activities reaches ${fmt(tenK.total)} events (${(tenK.pctOfTerminate * 100).toFixed(0)}% of ` +
      'the limit) — inside the hard cap but past the warning threshold, with no margin for retries. ' +
      'A single retry storm would push it over.',
  );
  lines.push('');
}
lines.push('This **validates the child-workflow-per-shard design** in ADR 0009 §8.3, and sharpens it:');
lines.push('');
lines.push(`- The parent workflow must dispatch **child workflows**, not activities, beyond ~${fmt(maxSingle)} units.`);
lines.push(`- Shard batch size should target ≤ ${fmt(Math.floor(maxSingle / 2))} activities per child, leaving room for retries.`);
lines.push('- ADR 0009\'s "500 concurrent children" cap is about concurrency, not history. Both caps are needed and they are not the same constraint.');
lines.push('- A parent coordinating N children spends ~5 events per child, so the parent tolerates far more shards than a flat workflow tolerates activities.');
lines.push('');
lines.push('## What the real Gate B run must confirm');
lines.push('');
lines.push('1. Actual configured limits on the deployed cluster (may differ from documented defaults).');
lines.push('2. Real `completionsPerWorkflowTask` under our concurrency — the highest-leverage unknown.');
lines.push('3. Real bytes per event with our payload shapes.');
lines.push('4. Whether continue-as-new is needed for long-lived parents, and at what child count.');
lines.push('5. Replay latency at each scale — history size drives worker memory and recovery time.');
lines.push('');

console.info(lines.join('\n'));

// Exit 2 = "model produced an actionable finding requiring design attention".
// Not exit 1: this is a model, and a model must never be able to fail a gate.
const actionable = rows.some((r) => r.status === 'TERMINATES');
process.exit(actionable ? 2 : 0);
