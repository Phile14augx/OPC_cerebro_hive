#!/usr/bin/env node
/**
 * scripts/repo-inventory.mjs
 *
 * Generates a living, machine-readable inventory of every workspace package.
 * Output: stdout as a Markdown table, or JSON with --json flag.
 *
 * Columns:
 *   Package        canonical npm name
 *   Dir            path relative to root
 *   Kind           app | package | capability | service
 *   Lang           ts | js | go | python | java | rust | mixed
 *   tsconfig       ✓ / —
 *   typecheck      ✓ / — / ⚠ (present but non-canonical)
 *   lint           ✓ / —
 *   test           ✓ / —
 *   CI Job         which CI job covers this package
 *
 * Usage:
 *   node scripts/repo-inventory.mjs          # Markdown table to stdout
 *   node scripts/repo-inventory.mjs --json   # JSON to stdout
 *   pnpm repo:inventory                      # via package.json script
 */

import fs   from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "..");
const AS_JSON   = process.argv.includes("--json");

const CANONICAL_TYPECHECK = "tsc -p tsconfig.json --noEmit";

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

function detectKind(relPath) {
  if (relPath.startsWith("apps/"))                        return "app";
  if (relPath.startsWith("packages/capabilities/"))       return "capability";
  if (relPath.startsWith("packages/"))                    return "package";
  if (relPath.startsWith("services/"))                    return "service";
  return "unknown";
}

function detectLang(dir) {
  const hasTs  = exists(dir, "tsconfig.json");
  const hasGo  = exists(dir, "go.mod");
  const hasPy  = exists(dir, "pyproject.toml") || exists(dir, "requirements.txt") || exists(dir, "setup.py");
  const hasJvm = exists(dir, "build.gradle") || exists(dir, "build.gradle.kts") || exists(dir, "pom.xml");
  const hasRust= exists(dir, "Cargo.toml");

  const langs = [];
  if (hasTs)  langs.push("ts");
  if (hasGo)  langs.push("go");
  if (hasPy)  langs.push("python");
  if (hasJvm) langs.push("java");
  if (hasRust)langs.push("rust");
  if (langs.length === 0) langs.push("js");
  return langs.length === 1 ? langs[0] : "mixed";
}

// Which CI job covers this package?
const CI_JOBS = {
  // Go services from ci.yml matrix
  "services/swarm-api":       "go-services",
  "services/swarm-runtime":   "go-services",
  "services/memory-service":  "go-services",
  "services/router-service":  "go-services",
  "services/tool-gateway":    "go-services",
  // Python
  "services/agent-runner":      "python-services",
  "services/planner-service":   "python-services",
  "services/evaluation-service":"python-services",
  "services/learning-service":  "python-services",
  // JVM
  "services/academy-svc":   "jvm-services",
  "services/crm-svc":       "jvm-services",
  "services/platform-svc":  "jvm-services",
};

function detectCiJob(relPath, lang, scripts) {
  if (CI_JOBS[relPath]) return CI_JOBS[relPath];
  if (lang === "go")     return "go-services";
  if (lang === "python") return "python-services";
  if (lang === "java")   return "jvm-services";

  // Root-level app: covered by the explicit tsc step in CI
  if (relPath === ".")   return "typecheck-lint (tsc direct)";

  // TS workspace package: covered by turbo typecheck if it has the script
  if (scripts?.typecheck) return "typecheck-lint (turbo)";

  return "NONE ⚠";
}

// ── Main ──────────────────────────────────────────────────────────────────────

const globs   = parseWorkspaceGlobs();
const pkgDirs = [...new Set(globs.flatMap(collectPackages))];

// Also include root
const rows = [];

for (const dir of pkgDirs) {
  const pkg     = readJson(path.join(dir, "package.json")) ?? {};
  const relPath = path.relative(ROOT, dir).replace(/\\/g, "/");
  const scripts = pkg.scripts ?? {};
  const lang    = detectLang(dir);
  const hasTsc  = exists(dir, "tsconfig.json");

  let typecheckStatus = "—";
  if (scripts.typecheck) {
    typecheckStatus = scripts.typecheck === CANONICAL_TYPECHECK ? "✓" : "⚠";
  }

  rows.push({
    package:   pkg.name ?? relPath,
    dir:       relPath,
    kind:      detectKind(relPath),
    lang,
    tsconfig:  hasTsc ? "✓" : "—",
    typecheck: typecheckStatus,
    lint:      scripts.lint    ? "✓" : "—",
    test:      scripts.test    ? "✓" : "—",
    ciJob:     detectCiJob(relPath, lang, scripts),
    _scripts:  scripts,
  });
}

rows.sort((a, b) => {
  const kindOrder = { app: 0, package: 1, capability: 2, service: 3, unknown: 4 };
  return (kindOrder[a.kind] - kindOrder[b.kind]) || a.dir.localeCompare(b.dir);
});

if (AS_JSON) {
  const out = rows.map(r => ({
    package:   r.package,
    dir:       r.dir,
    kind:      r.kind,
    lang:      r.lang,
    tsconfig:  r.tsconfig,
    typecheck: r.typecheck,
    lint:      r.lint,
    test:      r.test,
    ciJob:     r.ciJob,
  }));
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

// Markdown table
const cols = ["Package", "Dir", "Kind", "Lang", "tsconfig", "typecheck", "lint", "test", "CI Job"];
const colWidths = cols.map((c, i) => {
  const key = ["package","dir","kind","lang","tsconfig","typecheck","lint","test","ciJob"][i];
  return Math.max(c.length, ...rows.map(r => String(r[key]).length));
});

function row(cells) {
  return "| " + cells.map((c, i) => c.padEnd(colWidths[i])).join(" | ") + " |";
}
function sep() {
  return "| " + colWidths.map(w => "-".repeat(w)).join(" | ") + " |";
}

console.log(`\n# CerebroHive Package Inventory — ${rows.length} workspace packages\n`);
console.log(`Generated: ${new Date().toISOString()}\n`);
console.log(row(cols));
console.log(sep());

for (const r of rows) {
  console.log(row([r.package, r.dir, r.kind, r.lang, r.tsconfig, r.typecheck, r.lint, r.test, r.ciJob]));
}

// Summary
const counts = { ts: 0, withTypecheck: 0, noTypecheck: 0, nonCanonical: 0, withCi: 0, noCi: 0 };
for (const r of rows) {
  if (r.tsconfig === "✓") { counts.ts++; }
  if (r.typecheck === "✓") counts.withTypecheck++;
  else if (r.typecheck === "⚠") counts.nonCanonical++;
  else if (r.tsconfig === "✓") counts.noTypecheck++;
  if (r.ciJob !== "NONE ⚠") counts.withCi++;
  else counts.noCi++;
}

console.log(`
## Summary

| Metric | Count |
|--------|-------|
| Total packages | ${rows.length} |
| TypeScript (tsconfig.json) | ${counts.ts} |
| typecheck ✓ (canonical) | ${counts.withTypecheck} |
| typecheck ⚠ (non-canonical) | ${counts.nonCanonical} |
| typecheck — (missing, has tsconfig) | ${counts.noTypecheck} |
| Covered by CI | ${counts.withCi} |
| No CI coverage | ${counts.noCi} |
`);
