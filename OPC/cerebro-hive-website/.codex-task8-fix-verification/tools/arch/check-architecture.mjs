#!/usr/bin/env node
/**
 * CerebroEDA architecture conformance checks.
 *
 * Complements dependency-cruiser (which checks imports) with checks that
 * structure and documentation stay in sync with the ADRs. Run in CI via
 * `pnpm run arch:check`.
 *
 * Exit non-zero on any violation — architecture should fail the build, not
 * generate a report nobody reads.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ADR_DIR = join(ROOT, 'docs/architecture/adr');
/** Phase the repository is currently building. Drives scaffold-exemption expiry. */
const CURRENT_PHASE = Number(process.env.EDA_PHASE ?? '0');

const LAYERS = ['domain', 'platform', 'capability', 'edge', 'service', 'app'];

/** Layer N may depend only on layers at or below its own index. */
const LAYER_RANK = Object.fromEntries(LAYERS.map((l, i) => [l, i]));

const violations = [];
const fail = (rule, where, msg) => violations.push({ rule, where, msg });

function edaWorkspaces() {
  const out = [];
  for (const group of ['packages', 'services', 'apps']) {
    const dir = join(ROOT, group);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (!name.startsWith('eda-')) continue;
      const path = join(dir, name);
      if (!statSync(path).isDirectory()) continue;
      const pkgFile = join(path, 'package.json');
      if (!existsSync(pkgFile)) continue;
      out.push({ name, path, pkg: JSON.parse(readFileSync(pkgFile, 'utf8')) });
    }
  }
  return out;
}

function knownAdrs() {
  return new Set(
    readdirSync(ADR_DIR)
      .filter((f) => /^\d{4}-.*\.md$/.test(f))
      .map((f) => f.slice(0, 4)),
  );
}

// ---------------------------------------------------------------------------
// Check 1 — every eda workspace declares a layer and at least one governing ADR
// ---------------------------------------------------------------------------
function checkMetadata(workspaces, adrs) {
  for (const ws of workspaces) {
    const meta = ws.pkg.cerebroEda;
    const where = relative(ROOT, ws.path);
    if (!meta) {
      fail('metadata', where, 'package.json is missing the "cerebroEda" block (layer + adr).');
      continue;
    }
    if (!LAYERS.includes(meta.layer)) {
      fail('metadata', where, `Unknown layer "${meta.layer}". Expected one of: ${LAYERS.join(', ')}.`);
    }
    if (!Array.isArray(meta.adr) || meta.adr.length === 0) {
      fail('metadata', where, 'No governing ADR declared. Every package exists because a decision put it there.');
      continue;
    }
    for (const id of meta.adr) {
      if (!adrs.has(id)) {
        fail('adr-reference', where, `References ADR ${id}, which does not exist in docs/architecture/adr/.`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Check 2 — layering. A package may not depend on a higher layer.
// ---------------------------------------------------------------------------
function checkLayering(workspaces) {
  const byName = new Map(workspaces.map((w) => [w.pkg.name, w]));
  for (const ws of workspaces) {
    const from = ws.pkg.cerebroEda?.layer;
    if (!from) continue;
    for (const dep of Object.keys(ws.pkg.dependencies ?? {})) {
      const target = byName.get(dep);
      if (!target) continue;
      const to = target.pkg.cerebroEda?.layer;
      if (!to) continue;
      if (LAYER_RANK[to] > LAYER_RANK[from]) {
        fail(
          'layering',
          relative(ROOT, ws.path),
          `${ws.pkg.name} (${from}) depends on ${dep} (${to}). Dependencies point inward, never outward.`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Check 3 — README must name the ADRs, so the reasoning is one click away
// ---------------------------------------------------------------------------
function checkReadmes(workspaces) {
  for (const ws of workspaces) {
    const readme = join(ws.path, 'README.md');
    const where = relative(ROOT, ws.path);
    if (!existsSync(readme)) {
      fail('readme', where, 'Missing README.md.');
      continue;
    }
    const text = readFileSync(readme, 'utf8');
    if (!/Governing ADRs?:/i.test(text)) {
      fail('readme', where, 'README does not state its governing ADRs.');
    }
  }
}

// ---------------------------------------------------------------------------
// Check 4 — every ADR listed in the verification matrix has an enforcement
//           mechanism, and every EDA ADR appears in the matrix
// ---------------------------------------------------------------------------
function checkVerificationMatrix(adrs) {
  const matrixPath = join(ROOT, 'docs/architecture/CEREBROEDA-VERIFICATION-MATRIX.md');
  if (!existsSync(matrixPath)) {
    fail('matrix', 'docs/architecture', 'CEREBROEDA-VERIFICATION-MATRIX.md is missing.');
    return;
  }
  const matrix = readFileSync(matrixPath, 'utf8');
  // EDA ADRs are 0009+; earlier ones predate CerebroEDA.
  for (const id of [...adrs].filter((a) => Number(a) >= 9).sort()) {
    if (!matrix.includes(id)) {
      fail(
        'matrix',
        `adr/${id}`,
        `ADR ${id} has no row in the verification matrix. An ADR without an enforcement ` +
          'mechanism is documentation, not architecture.',
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Check 5 — dead package detection
// ---------------------------------------------------------------------------
function checkDeadPackages(workspaces) {
  const referenced = new Set();
  for (const ws of workspaces) {
    for (const dep of Object.keys(ws.pkg.dependencies ?? {})) referenced.add(dep);
  }
  for (const ws of workspaces) {
    const layer = ws.pkg.cerebroEda?.layer;
    // Apps and services are entry points; nothing is expected to import them.
    if (layer === 'app' || layer === 'service' || layer === 'edge') continue;
    if (referenced.has(ws.pkg.name)) continue;

    // Scaffold exemption. Deliberately time-boxed: a package may be unwired only
    // until the phase that is supposed to wire it. Once CURRENT_PHASE reaches it,
    // the exemption expires and this fails — so "temporary" cannot drift into
    // permanent, which is how dead packages normally accumulate.
    const until = ws.pkg.cerebroEda?.scaffoldUntilPhase;
    if (typeof until === 'number' && CURRENT_PHASE < until) continue;

    fail(
      'dead-package',
      relative(ROOT, ws.path),
      typeof until === 'number'
        ? `${ws.pkg.name} was scaffolded for Phase ${String(until)} and is still imported by nothing. ` +
          'Wire it up or delete it.'
        : `${ws.pkg.name} is imported by nothing. Either wire it up or delete it — ` +
          'unused packages accumulate and obscure the real dependency graph.',
    );
  }
}

const workspaces = edaWorkspaces();
const adrs = knownAdrs();

checkMetadata(workspaces, adrs);
checkLayering(workspaces);
checkReadmes(workspaces);
checkVerificationMatrix(adrs);
checkDeadPackages(workspaces);

if (violations.length === 0) {
  console.info(`architecture: OK (${String(workspaces.length)} eda workspaces, ${String(adrs.size)} ADRs)`);
  process.exit(0);
}

console.error(`\narchitecture: ${String(violations.length)} violation(s)\n`);
for (const v of violations) {
  console.error(`  [${v.rule}] ${v.where}\n      ${v.msg}\n`);
}
process.exit(1);
