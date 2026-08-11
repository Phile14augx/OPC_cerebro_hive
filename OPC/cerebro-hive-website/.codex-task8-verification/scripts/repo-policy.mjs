#!/usr/bin/env node
/**
 * scripts/repo-policy.mjs
 *
 * Enforces monorepo conventions on every workspace package:
 *
 *   RULE 1  If tsconfig.json exists → package.json must have "typecheck"
 *   RULE 2  If eslint.config.* or .eslintrc.* exists → must have "lint"
 *   RULE 3  If vitest.config.* or jest.config.* exists → must have "test"
 *   RULE 4  "typecheck" value must be "tsc -p tsconfig.json --noEmit" (canonical form)
 *
 * Exit 0 = all policies pass.
 * Exit 1 = one or more violations found (prints a summary table).
 *
 * Usage:
 *   node scripts/repo-policy.mjs          # check
 *   node scripts/repo-policy.mjs --fix    # auto-add missing scripts (rule 1 only)
 *   pnpm repo:policy                      # via package.json script
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FIX  = process.argv.includes("--fix");

// ── Helpers ───────────────────────────────────────────────────────────────────

function exists(...parts) {
  return fs.existsSync(path.join(...parts));
}

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch { return null; }
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + "\n");
}

function hasGlob(dir, patterns) {
  try {
    const entries = fs.readdirSync(dir);
    return patterns.some(p => {
      if (p.includes("*")) {
        const prefix = p.split("*")[0];
        return entries.some(e => e.startsWith(prefix));
      }
      return entries.includes(p);
    });
  } catch { return false; }
}

// ── Workspace discovery ───────────────────────────────────────────────────────

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

// ── Policy checks ─────────────────────────────────────────────────────────────

const CANONICAL_TYPECHECK = "tsc -p tsconfig.json --noEmit";

const ESLINT_CONFIGS = [
  "eslint.config.js", "eslint.config.mjs", "eslint.config.ts", "eslint.config.cjs",
  ".eslintrc.js", ".eslintrc.cjs", ".eslintrc.json", ".eslintrc.yml", ".eslintrc.yaml",
];

const VITEST_CONFIGS  = ["vitest.config.ts", "vitest.config.js", "vitest.config.mjs"];
const JEST_CONFIGS    = ["jest.config.ts", "jest.config.js", "jest.config.json"];

function checkPackage(pkgDir) {
  const pkgJsonPath = path.join(pkgDir, "package.json");
  const pkg = readJson(pkgJsonPath);
  if (!pkg) return [{ rule: "PARSE", message: "Cannot parse package.json", fixable: false }];

  const scripts  = pkg.scripts ?? {};
  const label    = path.relative(ROOT, pkgDir);
  const issues   = [];

  // RULE 1 — typecheck required if tsconfig.json present
  if (exists(pkgDir, "tsconfig.json")) {
    if (!scripts.typecheck) {
      issues.push({ rule: "R1", message: `Missing "typecheck" script`, label, fixable: true, pkg, pkgJsonPath });
    } else if (scripts.typecheck !== CANONICAL_TYPECHECK) {
      issues.push({
        rule: "R4",
        message: `Non-canonical typecheck: "${scripts.typecheck}" (expected: "${CANONICAL_TYPECHECK}")`,
        label,
        fixable: false,
      });
    }
  }

  // RULE 2 — lint required if eslint config present
  if (hasGlob(pkgDir, ESLINT_CONFIGS) && !scripts.lint) {
    issues.push({ rule: "R2", message: `Missing "lint" script (eslint config found)`, label, fixable: false });
  }

  // RULE 3 — test required if vitest/jest config present
  const hasTestConfig = hasGlob(pkgDir, [...VITEST_CONFIGS, ...JEST_CONFIGS]);
  if (hasTestConfig && !scripts.test) {
    issues.push({ rule: "R3", message: `Missing "test" script (test config found)`, label, fixable: false });
  }

  return issues;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const workspaceGlobs = parseWorkspaceGlobs();
const allDirs = [...new Set(workspaceGlobs.flatMap(collectPackages))];

console.log(`\n📦 CerebroHive repo-policy — checking ${allDirs.length} workspace packages\n`);

let totalViolations = 0;
let autoFixed = 0;

for (const pkgDir of allDirs) {
  const issues = checkPackage(pkgDir);
  for (const issue of issues) {
    if (FIX && issue.fixable && issue.rule === "R1") {
      // Auto-fix: add canonical typecheck script
      issue.pkg.scripts = issue.pkg.scripts ?? {};
      issue.pkg.scripts.typecheck = CANONICAL_TYPECHECK;
      writeJson(issue.pkgJsonPath, issue.pkg);
      console.log(`  🔧 FIXED  [${issue.rule}] ${issue.label}: added typecheck script`);
      autoFixed++;
    } else {
      console.error(`  ❌ FAIL   [${issue.rule}] ${issue.label}: ${issue.message}`);
      totalViolations++;
    }
  }
}

console.log("");

if (autoFixed > 0) {
  console.log(`✅ Auto-fixed ${autoFixed} package(s). Re-run without --fix to confirm.\n`);
}

if (totalViolations === 0) {
  console.log(`✅ repo-policy: all ${allDirs.length} packages pass (${autoFixed} auto-fixed)\n`);
  process.exit(0);
} else {
  console.error(`❌ repo-policy: ${totalViolations} violation(s) found across ${allDirs.length} packages\n`);
  process.exit(1);
}
