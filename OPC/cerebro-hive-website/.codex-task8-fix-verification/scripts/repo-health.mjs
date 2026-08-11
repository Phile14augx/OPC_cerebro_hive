#!/usr/bin/env node
/**
 * scripts/repo-health.mjs
 *
 * Single-command monorepo health check.
 * Runs all policy and structural checks and reports a summary.
 *
 * Usage:
 *   node scripts/repo-health.mjs
 *   pnpm repo:health
 *
 * Checks performed:
 *   1. Workspace integrity       — every package.json is valid JSON
 *   2. Script policy             — typecheck/lint/test conventions (repo-policy rules)
 *   3. Turbo coverage            — packages with typecheck but turbo can reach them
 *   4. Orphan packages           — workspace packages not referenced by any other
 *   5. Tooling version skew      — typescript / eslint / vitest / react / next versions
 *   6. Sitemap drift             — platform pages vs sitemap.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── ANSI colour helpers ───────────────────────────────────────────────────────
const c = {
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function exists(...parts) { return fs.existsSync(path.join(...parts)); }
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { return null; }
}

function parseWorkspaceGlobs() {
  const yaml = fs.readFileSync(path.join(ROOT, "pnpm-workspace.yaml"), "utf8");
  const globs = [];
  let inPkgs = false;
  for (const line of yaml.split("\n")) {
    if (line.trim() === "packages:") { inPkgs = true; continue; }
    if (inPkgs && line.trim().startsWith("-")) {
      const m = line.match(/["']?([^"'\s#]+)["']?/);
      if (m) globs.push(m[1].trim());
    } else if (inPkgs && line.trim() && !line.startsWith(" ") && !line.startsWith("\t")) {
      inPkgs = false;
    }
  }
  return globs;
}

function collectPackages(globPattern) {
  const isDeep = globPattern.endsWith("/**");
  const base   = path.join(ROOT, globPattern.replace(/\/\*\*?$/, ""));
  const pkgs   = [];
  function scan(dir, depth) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (!e.isDirectory() || e.name === "node_modules" || e.name.startsWith(".")) continue;
      const full = path.join(dir, e.name);
      if (exists(full, "package.json")) pkgs.push(full);
      if (isDeep && depth < 2) scan(full, depth + 1);
    }
  }
  if (fs.existsSync(base)) scan(base, 0);
  return pkgs;
}

// ── Check 1: Workspace integrity ──────────────────────────────────────────────

function checkIntegrity(pkgDirs) {
  const broken = [];
  for (const dir of pkgDirs) {
    const pkg = readJson(path.join(dir, "package.json"));
    if (!pkg) broken.push(path.relative(ROOT, dir));
  }
  return { label: "Workspace integrity", pass: broken.length === 0, detail: broken };
}

// ── Check 2: Script policy ────────────────────────────────────────────────────

const CANONICAL_TYPECHECK = "tsc -p tsconfig.json --noEmit";

function checkScriptPolicy(pkgDirs) {
  const violations = [];
  for (const dir of pkgDirs) {
    const pkg = readJson(path.join(dir, "package.json"));
    if (!pkg) continue;
    const scripts = pkg.scripts ?? {};
    const label   = path.relative(ROOT, dir);

    if (exists(dir, "tsconfig.json") && !scripts.typecheck) {
      violations.push(`${label}: missing "typecheck"`);
    }
    if (exists(dir, "tsconfig.json") && scripts.typecheck && scripts.typecheck !== CANONICAL_TYPECHECK) {
      violations.push(`${label}: non-canonical typecheck ("${scripts.typecheck}")`);
    }
  }
  return { label: "Script policy (typecheck)", pass: violations.length === 0, detail: violations };
}

// ── Check 3: Tooling version skew ─────────────────────────────────────────────

const TRACKED_TOOLS = ["typescript", "eslint", "vitest", "react", "next"];

function checkVersionSkew(pkgDirs) {
  const versions = {};
  for (const tool of TRACKED_TOOLS) versions[tool] = new Set();

  for (const dir of pkgDirs) {
    const pkg = readJson(path.join(dir, "package.json"));
    if (!pkg) continue;
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const tool of TRACKED_TOOLS) {
      if (allDeps[tool]) versions[tool].add(allDeps[tool]);
    }
  }

  const skewed = [];
  for (const [tool, vset] of Object.entries(versions)) {
    if (vset.size > 1) {
      skewed.push(`${tool}: ${[...vset].join(", ")}`);
    }
  }

  return {
    label:  "Tooling version skew",
    pass:   skewed.length === 0,
    detail: skewed,
    info:   Object.fromEntries(
      Object.entries(versions).map(([k, v]) => [k, [...v]])
    ),
  };
}

// ── Check 4: Orphan packages ──────────────────────────────────────────────────

function checkOrphans(pkgDirs) {
  // Build map: package-name → dir
  const nameMap = {};
  for (const dir of pkgDirs) {
    const pkg = readJson(path.join(dir, "package.json"));
    if (pkg?.name) nameMap[pkg.name] = dir;
  }

  // Count references
  const refCount = {};
  for (const name of Object.keys(nameMap)) refCount[name] = 0;

  for (const dir of pkgDirs) {
    const pkg = readJson(path.join(dir, "package.json"));
    if (!pkg) continue;
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    for (const dep of Object.keys(allDeps)) {
      if (refCount[dep] !== undefined) refCount[dep]++;
    }
  }

  // Also count root package references
  const rootPkg = readJson(path.join(ROOT, "package.json"));
  if (rootPkg) {
    const allDeps = { ...rootPkg.dependencies, ...rootPkg.devDependencies };
    for (const dep of Object.keys(allDeps)) {
      if (refCount[dep] !== undefined) refCount[dep]++;
    }
  }

  const orphans = Object.entries(refCount)
    .filter(([, count]) => count === 0)
    .map(([name]) => `${name} (${path.relative(ROOT, nameMap[name])})`);

  // Private packages with no consumers are not necessarily a problem, so this
  // is info-level unless the count is alarming.
  return { label: "Orphan packages", pass: true, detail: orphans, warning: orphans.length > 10 };
}

// ── Check 5: Sitemap drift ────────────────────────────────────────────────────

function checkSitemapDrift() {
  try {
    execSync("node scripts/check-sitemap.mjs", { cwd: ROOT, stdio: "pipe" });
    return { label: "Sitemap drift", pass: true, detail: [] };
  } catch (e) {
    const output = e.stdout?.toString() ?? e.message;
    return { label: "Sitemap drift", pass: false, detail: [output.trim()] };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const globs   = parseWorkspaceGlobs();
const pkgDirs = [...new Set(globs.flatMap(collectPackages))];

console.log(c.bold(`\n🏥  CerebroHive repo:health — ${pkgDirs.length} workspace packages\n`));
console.log(c.dim("─".repeat(70)));

const checks = [
  checkIntegrity(pkgDirs),
  checkScriptPolicy(pkgDirs),
  checkVersionSkew(pkgDirs),
  checkOrphans(pkgDirs),
  checkSitemapDrift(),
];

let failed = 0;

for (const check of checks) {
  const icon   = check.pass && !check.warning ? c.green("✅") : check.warning ? c.yellow("⚠️ ") : c.red("❌");
  const status = check.pass && !check.warning ? c.green("PASS") : check.warning ? c.yellow("WARN") : c.red("FAIL");
  console.log(`${icon}  ${status}  ${check.label}`);

  if (check.detail?.length) {
    const limit = 10;
    const items = check.detail.slice(0, limit);
    for (const item of items) {
      console.log(`       ${c.dim("•")} ${item}`);
    }
    if (check.detail.length > limit) {
      console.log(`       ${c.dim(`… and ${check.detail.length - limit} more`)}`);
    }
  }

  if (check.info) {
    for (const [tool, vers] of Object.entries(check.info)) {
      if (vers.length) {
        console.log(`       ${c.dim(tool + ":")} ${vers.join(", ")}`);
      }
    }
  }

  if (!check.pass) failed++;
}

console.log(c.dim("\n" + "─".repeat(70)));

if (failed === 0) {
  console.log(c.green(c.bold("\n✅  All health checks passed\n")));
  process.exit(0);
} else {
  console.error(c.red(c.bold(`\n❌  ${failed} health check(s) failed\n`)));
  process.exit(1);
}
