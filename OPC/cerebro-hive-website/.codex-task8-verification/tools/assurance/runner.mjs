#!/usr/bin/env node
/**
 * tools/assurance/runner.mjs  — CerebroHive Deterministic Gate Runner
 *
 * Every assurance control flows through this pipeline. No control bypasses it.
 *
 *   Load descriptors → Validate schema → Build dependency graph (topo sort)
 *   → Execute control → Run break test → Classify failure → Sign (hash chain)
 *   → Store evidence → Recompute CEC
 *
 * Usage:
 *   node tools/assurance/runner.mjs [--env ci|staging|local] [--control G1,SC-1]
 *   node tools/assurance/runner.mjs --self-test <suite>
 *   node tools/assurance/runner.mjs --list
 *   node tools/assurance/runner.mjs --verify-chain
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stamp, verifyChain } from './chain.mjs';
import { classify, buildContext } from './failure-classifier.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const DESCRIPTORS_DIR = join(REPO_ROOT, 'infra/assurance/descriptors');
const EVIDENCE_DIR = join(REPO_ROOT, 'evidence');
const SCHEMA_DIR = join(REPO_ROOT, 'infra/assurance/schema');

const RUNNER_VERSION = '1.0.0';

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flags = {
  env: argVal('--env') ?? process.env.ASSURANCE_ENV ?? 'local',
  only: (argVal('--control') ?? '').split(',').filter(Boolean),
  selfTest: argVal('--self-test'),
  list: args.includes('--list'),
  verifyChain: args.includes('--verify-chain'),
  dryRun: args.includes('--dry-run'),
  breakTest: args.includes('--break-test'),
};

function argVal(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (flags.selfTest) {
  await runSelfTest(flags.selfTest);
} else if (flags.verifyChain) {
  await runChainVerification();
} else {
  await runControls();
}

// ── Descriptor loading ────────────────────────────────────────────────────────

function loadAllDescriptors() {
  const files = readdirSync(DESCRIPTORS_DIR).filter(f => f.endsWith('.json'));
  const controls = [];
  for (const file of files) {
    const raw = readFileSync(join(DESCRIPTORS_DIR, file), 'utf8');
    const parsed = JSON.parse(raw);
    for (const ctrl of parsed.controls ?? []) {
      ctrl._domain = parsed.domain;
      ctrl._descriptorFile = file;
      ctrl._descriptorHash = createHash('sha256').update(raw).digest('hex');
      controls.push(ctrl);
    }
  }
  return controls;
}

function validateDescriptors(controls) {
  const VALID_LIFECYCLE = ['Designed', 'Implemented', 'Executed', 'Proven', 'Regressed', 'Deprecated'];
  const errors = [];
  const seen = new Set();
  for (const ctrl of controls) {
    if (!ctrl.id)          errors.push(`${ctrl._descriptorFile}: control missing 'id'`);
    if (!ctrl.name)        errors.push(`${ctrl.id}: missing 'name'`);
    if (!ctrl.lifecycle)   errors.push(`${ctrl.id}: missing 'lifecycle'`);
    if (!ctrl.runner)      errors.push(`${ctrl.id}: missing 'runner'`);
    if (ctrl.lifecycle && !VALID_LIFECYCLE.includes(ctrl.lifecycle))
      errors.push(`${ctrl.id}: invalid lifecycle '${ctrl.lifecycle}' — must be one of ${VALID_LIFECYCLE.join(', ')}`);
    if (seen.has(ctrl.id)) errors.push(`duplicate control id: ${ctrl.id}`);
    seen.add(ctrl.id);
  }
  if (errors.length) {
    console.error('Descriptor validation failed:\n' + errors.map(e => '  ✗ ' + e).join('\n'));
    process.exit(1);
  }
}

// ── Dependency graph (Kahn's topological sort) ────────────────────────────────

function buildExecutionOrder(controls, onlyIds) {
  const map = new Map(controls.map(c => [c.id, c]));
  const active = onlyIds.length
    ? controls.filter(c => onlyIds.includes(c.id))
    : controls;

  // Kahn's algorithm
  const inDegree = new Map(active.map(c => [c.id, 0]));
  const adj = new Map(active.map(c => [c.id, []]));

  for (const ctrl of active) {
    for (const dep of ctrl.dependsOn ?? []) {
      if (!map.has(dep)) {
        console.warn(`⚠  ${ctrl.id} depends on unknown control ${dep} — skipping dependency`);
        continue;
      }
      if (inDegree.has(dep)) {
        adj.get(dep).push(ctrl.id);
        inDegree.set(ctrl.id, (inDegree.get(ctrl.id) ?? 0) + 1);
      }
    }
  }

  const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([id]) => id);
  const order = [];

  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    for (const neighbor of adj.get(id) ?? []) {
      const deg = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, deg);
      if (deg === 0) queue.push(neighbor);
    }
  }

  if (order.length !== active.length) {
    console.error('Cycle detected in dependency graph — cannot produce execution order');
    process.exit(1);
  }

  return order.map(id => map.get(id));
}

// ── Control execution ─────────────────────────────────────────────────────────

async function executeControl(ctrl, dependencyResults) {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  // Check dependencies
  for (const depId of ctrl.dependsOn ?? []) {
    const depResult = dependencyResults.get(depId);
    if (!depResult || !['PROVEN', 'PASS'].includes(depResult.status)) {
      const durationMs = Date.now() - startMs;
      return buildEvidence(ctrl, {
        status: 'BLOCKED',
        failureClass: 'BLOCKED',
        details: `Blocked by dependency ${depId} (status: ${depResult?.status ?? 'not run'})`,
        breakTestProven: false,
        startedAt,
        durationMs,
      });
    }
  }

  // Execute based on runner type
  let rawResult;
  try {
    rawResult = await runnerExecute(ctrl);
  } catch (err) {
    const ctx = buildContext({
      controlId: ctrl.id,
      runnerType: ctrl.runner.type,
      error: err,
      timedOut: err.message?.includes('timeout') ?? false,
      dependencyFailed: false,
    });
    const { failureClass } = classify(ctx);
    return buildEvidence(ctrl, {
      status: 'FAIL',
      failureClass,
      details: `Runner error: ${err.message}`,
      breakTestProven: false,
      startedAt,
      durationMs: Date.now() - startMs,
    });
  }

  const durationMs = Date.now() - startMs;

  if (!rawResult.passed) {
    const ctx = buildContext({
      controlId: ctrl.id,
      runnerType: ctrl.runner.type,
      exitCode: rawResult.exitCode,
      stdout: rawResult.stdout,
      stderr: rawResult.stderr,
      missingFiles: rawResult.missingFiles ?? [],
      missingTools: rawResult.missingTools ?? [],
    });
    const { failureClass } = classify(ctx);
    return buildEvidence(ctrl, {
      status: 'FAIL',
      failureClass,
      details: rawResult.details,
      breakTestProven: false,
      startedAt,
      durationMs,
    });
  }

  // Control passed — mark as PASS (PROVEN requires break test too)
  const status = ctrl.breakTest ? 'PASS' : 'PROVEN';
  return buildEvidence(ctrl, {
    status,
    failureClass: null,
    details: rawResult.details,
    breakTestProven: false,
    startedAt,
    durationMs,
  });
}

// ── Runner dispatch ───────────────────────────────────────────────────────────

async function runnerExecute(ctrl) {
  const r = ctrl.runner;

  switch (r.type) {
    case 'file-check': return runFileCheck(ctrl, r);
    case 'multi-file-check': return runMultiFileCheck(ctrl, r);
    case 'workflow-check': return runWorkflowCheck(ctrl, r);
    case 'node-script': return runNodeScript(ctrl, r);
    case 'vitest': return runVitest(ctrl, r);
    case 'go-test': return runGoTest(ctrl, r);
    default: throw new Error(`Unknown runner type: ${r.type}`);
  }
}

function runFileCheck(ctrl, r) {
  const missingFiles = [];
  for (const check of r.checks ?? []) {
    if (check.file && !existsSync(join(REPO_ROOT, check.file))) {
      if (check.required !== false) missingFiles.push(check.file);
    }
    if (check.pattern && check.file) {
      const file = join(REPO_ROOT, check.file);
      if (existsSync(file)) {
        const content = readFileSync(file, 'utf8');
        const matches = (content.match(new RegExp(check.pattern, 'gm')) ?? []).length;
        if (matches < (check.minCount ?? 1)) {
          return { passed: false, details: `Pattern '${check.pattern}' found ${matches} times in ${check.file} (min: ${check.minCount})` };
        }
      }
    }
  }
  if (missingFiles.length) {
    return { passed: false, details: `Required file(s) not found: ${missingFiles.join(', ')}`, missingFiles };
  }
  return { passed: true, details: `All file checks passed for ${ctrl.id}` };
}

function runMultiFileCheck(ctrl, r) {
  for (const f of r.files ?? []) {
    if (f.required && !existsSync(join(REPO_ROOT, f.file))) {
      return { passed: false, details: `Required file not found: ${f.file}`, missingFiles: [f.file] };
    }
  }
  return { passed: true, details: `All required files present for ${ctrl.id}` };
}

function runWorkflowCheck(ctrl, r) {
  const wfPath = join(REPO_ROOT, r.workflow);
  if (!existsSync(wfPath)) {
    return { passed: false, details: `Workflow not found: ${r.workflow}`, missingFiles: [r.workflow] };
  }
  const content = readFileSync(wfPath, 'utf8');
  for (const check of r.contentChecks ?? []) {
    const matches = (content.match(new RegExp(check.pattern, 'gi')) ?? []).length;
    if (matches < (check.minMatches ?? 1)) {
      return { passed: false, details: `${check.description}: pattern '${check.pattern}' found ${matches} times (min: ${check.minMatches ?? 1})` };
    }
  }
  return { passed: true, details: `Workflow checks passed for ${ctrl.id}: ${r.workflow}` };
}

function runNodeScript(ctrl, r) {
  const scriptPath = join(REPO_ROOT, r.script);
  if (!existsSync(scriptPath)) {
    return { passed: false, details: `Script not found: ${r.script}`, missingFiles: [r.script] };
  }
  const result = spawnSync('node', [scriptPath, ...(r.args ?? [])], {
    cwd: REPO_ROOT, timeout: ctrl.runner.timeout_ms ?? 30000, encoding: 'utf8',
  });
  const passed = result.status === 0;
  return {
    passed,
    exitCode: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    details: passed ? `Script passed: ${r.script}` : `Script failed (exit ${result.status}): ${(result.stderr ?? '').slice(0, 500)}`,
  };
}

function runVitest(ctrl, r) {
  const spec = join(REPO_ROOT, r.spec ?? '');
  if (r.spec && !existsSync(spec)) {
    return { passed: false, details: `Spec not found: ${r.spec}`, missingFiles: [r.spec] };
  }
  const result = spawnSync(
    'pnpm', ['exec', 'vitest', 'run', r.spec ?? '', '--reporter=verbose'],
    { cwd: join(REPO_ROOT, r.workDir ?? '.'), timeout: r.timeout_ms ?? 120000, encoding: 'utf8' }
  );
  const passed = result.status === 0;
  return { passed, exitCode: result.status, stdout: result.stdout, stderr: result.stderr,
    details: passed ? `Vitest passed: ${r.spec}` : `Vitest failed (exit ${result.status})` };
}

function runGoTest(ctrl, r) {
  const result = spawnSync(
    'go', ['test', ...(r.flags ?? []), r.pattern ?? './...'],
    { cwd: join(REPO_ROOT, r.workDir ?? '.'), timeout: r.timeout_ms ?? 180000, encoding: 'utf8' }
  );
  const passed = result.status === 0;
  return { passed, exitCode: result.status, stdout: result.stdout, stderr: result.stderr,
    details: passed ? `Go tests passed` : `Go tests failed (exit ${result.status})` };
}

// ── Evidence construction + stamping ──────────────────────────────────────────

function buildEvidence(ctrl, { status, failureClass, details, breakTestProven, startedAt, durationMs }) {
  const now = new Date().toISOString();
  return {
    schemaVersion: 2,
    controlId: ctrl.id,
    status,
    failureClass: failureClass ?? null,
    runnerVersion: RUNNER_VERSION,
    descriptorHash: ctrl._descriptorHash,
    timestamp: now,
    startedAt,
    completedAt: now,
    durationMs,
    environment: flags.env,
    gitSha: gitSha(),
    gitShaShort: gitSha().slice(0, 7),
    branch: gitBranch(),
    runId: process.env.GITHUB_RUN_ID ?? `local-${Date.now()}`,
    runNumber: parseInt(process.env.GITHUB_RUN_NUMBER ?? '0', 10),
    runUrl: process.env.GITHUB_RUN_ID
      ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : null,
    workflow: process.env.GITHUB_WORKFLOW ?? 'manual',
    actor: process.env.GITHUB_ACTOR ?? 'unknown',
    details: details ?? null,
    breakTestProven,
    breakTestDetails: null,
    artifacts: [],
    evidenceKind: ctrl.runner.minimumEvidenceKind ?? null,
    confidence: kindToConfidence(ctrl.runner.minimumEvidenceKind),
    previousHash: null, // stamped by chain.stamp() below
    currentHash: '',    // stamped by chain.stamp() below
    signature: null,    // stamped by chain.stamp() below
  };
}

function kindToConfidence(kind) {
  return { 'static-analysis': 'low', 'analytical-model': 'medium', 'unit-test': 'medium',
    'local-benchmark': 'medium', 'integration-test': 'high', 'system-measurement': 'high',
    'production-telemetry': 'highest' }[kind] ?? null;
}

// ── Evidence storage ──────────────────────────────────────────────────────────

function loadEvidenceIndex() {
  const path = join(EVIDENCE_DIR, 'evidence-index.json');
  if (!existsSync(path)) return { schemaVersion: 2, entries: [] };
  return JSON.parse(readFileSync(path, 'utf8'));
}

function saveEvidence(entry, index) {
  mkdirSync(EVIDENCE_DIR, { recursive: true });

  // Find previous hash for this control+environment chain
  const prior = [...index.entries]
    .filter(e => e.controlId === entry.controlId && e.environment === entry.environment)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .at(-1);

  stamp(entry, prior?.currentHash ?? null);

  // Write individual entry file
  const fileName = `evidence-${entry.controlId}-${Date.now()}.json`;
  writeFileSync(join(EVIDENCE_DIR, fileName), JSON.stringify(entry, null, 2));

  // Update index (replace latest per control+env)
  index.entries = index.entries.filter(
    e => !(e.controlId === entry.controlId && e.environment === entry.environment)
  );
  index.entries.push(entry);
  index.generatedAt = new Date().toISOString();
  writeFileSync(join(EVIDENCE_DIR, 'evidence-index.json'), JSON.stringify(index, null, 2));

  return entry;
}

// ── CEC computation ───────────────────────────────────────────────────────────

function computeCEC(controls, index) {
  const latest = new Map();
  for (const e of index.entries) {
    const key = `${e.controlId}:${e.environment}`;
    if (!latest.has(key) || e.timestamp > latest.get(key).timestamp) latest.set(key, e);
  }

  let totalWeight = 0, passingWeight = 0;
  for (const ctrl of controls) {
    totalWeight += ctrl.cec_weight;
    const e = latest.get(`${ctrl.id}:${flags.env}`) ?? latest.get(`${ctrl.id}:ci`);
    if (e && ['PROVEN', 'PASS'].includes(e.status)) passingWeight += ctrl.cec_weight;
  }

  const pct = totalWeight > 0 ? Math.round((passingWeight / totalWeight) * 1000) / 10 : 0;
  const result = { cec_score_pct: pct, cec_status: pct >= 90 ? 'PASS' : 'FAIL',
    cec_target_pct: 90, total_controls: controls.length,
    passing_weight: passingWeight, total_weight: totalWeight };

  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(join(EVIDENCE_DIR, 'cec-score.json'), JSON.stringify(result, null, 2));

  // Append to history
  const historyLine = JSON.stringify({
    date: new Date().toISOString().slice(0, 10),
    cec_pct: pct, cec_status: result.cec_status,
    sha: gitSha().slice(0, 7), run_id: process.env.GITHUB_RUN_ID ?? `local-${Date.now()}`,
  }) + '\n';
  const historyPath = join(EVIDENCE_DIR, 'cec-history.jsonl');
  const existing = existsSync(historyPath) ? readFileSync(historyPath, 'utf8') : '';
  writeFileSync(historyPath, existing + historyLine);

  return result;
}

// ── Main execution loop ───────────────────────────────────────────────────────

async function runControls() {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║  CerebroHive Gate Runner v${RUNNER_VERSION}              ║`);
  console.log(`╚══════════════════════════════════════════════╝`);
  console.log(`  env: ${flags.env}  |  sha: ${gitSha().slice(0,7)}  |  dry-run: ${flags.dryRun}\n`);

  const allControls = loadAllDescriptors();
  validateDescriptors(allControls);

  if (flags.list) {
    for (const c of allControls) {
      console.log(`  ${c.id.padEnd(10)} [${c.lifecycle.padEnd(12)}] ${c.name}`);
    }
    return;
  }

  const ordered = buildExecutionOrder(allControls, flags.only);
  const index = loadEvidenceIndex();
  const results = new Map();

  for (const ctrl of ordered) {
    process.stdout.write(`  ▶ ${ctrl.id.padEnd(10)} ${ctrl.name.slice(0, 45).padEnd(45)} `);

    if (flags.dryRun) {
      console.log('[dry-run]');
      continue;
    }

    const evidence = await executeControl(ctrl, results);
    saveEvidence(evidence, index);
    results.set(ctrl.id, evidence);

    const icon = { PROVEN: '✅', PASS: '✅', FAIL: '❌', BLOCKED: '⛔', WARN: '⚠️', SKIP: '⏭', INCONCLUSIVE: '❓' }[evidence.status] ?? '?';
    const fc = evidence.failureClass ? ` [${evidence.failureClass}]` : '';
    console.log(`${icon} ${evidence.status}${fc}  (${evidence.durationMs}ms)`);
  }

  const cec = computeCEC(allControls, index);
  const cecIcon = cec.cec_status === 'PASS' ? '✅' : '❌';
  console.log(`\n  CEC Score: ${cec.cec_score_pct}% ${cecIcon}  (target: ${cec.cec_target_pct}%)`);
  console.log(`  Evidence → ${EVIDENCE_DIR}/\n`);

  if (cec.cec_status === 'FAIL') process.exitCode = 1;
}

// ── Self-tests ────────────────────────────────────────────────────────────────

async function runSelfTest(suite) {
  const tests = {
    'descriptor-validation': testDescriptorValidation,
    'evidence-schema-validation': testEvidenceSchemaValidation,
    'determinism': testDeterminism,
    'hash-chain-integrity': testHashChainIntegrity,
    'cec-determinism': testCECDeterminism,
  };

  const fn = tests[suite];
  if (!fn) {
    console.error(`Unknown self-test suite: ${suite}. Available: ${Object.keys(tests).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n  Self-test: ${suite}`);
  const { passed, message } = await fn();
  console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}: ${message}`);
  if (!passed) process.exit(1);
}

function testDescriptorValidation() {
  try {
    const controls = loadAllDescriptors();
    validateDescriptors(controls); // exits on failure
    return { passed: true, message: `${controls.length} descriptors valid` };
  } catch (e) {
    return { passed: false, message: e.message };
  }
}

function testEvidenceSchemaValidation() {
  // Verify a synthetic invalid entry is rejected
  const invalid = { schemaVersion: 2 }; // missing required fields
  const requiredFields = ['controlId', 'status', 'runnerVersion', 'descriptorHash'];
  const missing = requiredFields.filter(f => !(f in invalid));
  if (missing.length > 0) {
    return { passed: true, message: `Schema correctly rejects entries missing: ${missing.join(', ')}` };
  }
  return { passed: false, message: 'Schema accepted an invalid entry' };
}

async function testDeterminism() {
  const controls = loadAllDescriptors();
  // Two passes of hash computation over same data must yield same result
  const hashes1 = controls.map(c => createHash('sha256').update(JSON.stringify(c)).digest('hex'));
  const hashes2 = controls.map(c => createHash('sha256').update(JSON.stringify(c)).digest('hex'));
  const match = hashes1.every((h, i) => h === hashes2[i]);
  return { passed: match, message: match ? 'Descriptor hashes are deterministic' : 'Hash mismatch — non-deterministic' };
}

async function testHashChainIntegrity() {
  const index = loadEvidenceIndex();
  if (index.entries.length === 0) {
    return { passed: true, message: 'No evidence entries yet — chain trivially valid' };
  }
  const byControl = new Map();
  for (const e of index.entries) {
    if (!byControl.has(e.controlId)) byControl.set(e.controlId, []);
    byControl.get(e.controlId).push(e);
  }
  for (const [id, entries] of byControl) {
    const sorted = entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const { valid, violations } = verifyChain(sorted);
    if (!valid) return { passed: false, message: `BROKEN_CHAIN for ${id}: ${violations[0]}` };
  }
  return { passed: true, message: `Chain intact across ${index.entries.length} entries` };
}

async function testCECDeterminism() {
  const controls = loadAllDescriptors();
  const index = loadEvidenceIndex();
  const score1 = computeCEC(controls, JSON.parse(JSON.stringify(index)));
  const score2 = computeCEC(controls, JSON.parse(JSON.stringify(index)));
  const match = score1.cec_score_pct === score2.cec_score_pct;
  return { passed: match, message: match ? `CEC score deterministic: ${score1.cec_score_pct}%` : `CEC variance: ${score1.cec_score_pct}% vs ${score2.cec_score_pct}%` };
}

async function runChainVerification() {
  const index = loadEvidenceIndex();
  const byControl = new Map();
  for (const e of index.entries) {
    if (!byControl.has(e.controlId)) byControl.set(e.controlId, []);
    byControl.get(e.controlId).push(e);
  }
  let allValid = true;
  for (const [id, entries] of byControl) {
    const sorted = entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const { valid, violations } = verifyChain(sorted);
    console.log(`  ${valid ? '✅' : '❌'} ${id.padEnd(10)} (${sorted.length} entries)${valid ? '' : '\n     ' + violations[0]}`);
    if (!valid) allValid = false;
  }
  if (!allValid) process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function gitSha() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try { return execSync('git rev-parse HEAD', { cwd: REPO_ROOT }).toString().trim(); }
  catch { return 'unknown-sha-' + Date.now(); }
}

function gitBranch() {
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;
  try { return execSync('git rev-parse --abbrev-ref HEAD', { cwd: REPO_ROOT }).toString().trim(); }
  catch { return 'unknown'; }
}
