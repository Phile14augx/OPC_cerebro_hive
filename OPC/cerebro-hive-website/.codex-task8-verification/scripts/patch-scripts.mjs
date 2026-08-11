/**
 * patch-scripts.mjs
 * Adds `typecheck` and `lint` scripts to every workspace package that:
 *   - has a tsconfig.json, AND
 *   - is missing the corresponding script in its package.json
 *
 * Uses only Node.js built-ins. Does NOT touch node_modules.
 *
 * Usage: node scripts/patch-scripts.mjs [--dry-run]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

// ── 1. Read workspace globs from pnpm-workspace.yaml ──────────────────────────

function parseWorkspaceYaml() {
  const yaml = fs.readFileSync(path.join(ROOT, "pnpm-workspace.yaml"), "utf8");
  const lines = yaml.split("\n");
  const globs = [];
  let inPackages = false;
  for (const line of lines) {
    if (line.trim() === "packages:") { inPackages = true; continue; }
    if (inPackages) {
      if (line.trim().startsWith("-")) {
        const m = line.match(/["']?([^"'\s#]+)["']?/);
        if (m) globs.push(m[1].trim());
      } else if (line.trim() && !line.startsWith(" ") && !line.startsWith("\t")) {
        inPackages = false;
      }
    }
  }
  return globs;
}

// ── 2. Expand globs to actual package directories ─────────────────────────────

function expandGlob(globPattern) {
  const dirs = [];
  const isDeep = globPattern.endsWith("/**");
  const base = path.join(ROOT, globPattern.replace(/\/\*\*?$/, ""));
  if (!fs.existsSync(base)) return dirs;

  function scanDir(dir, depth) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const fullPath = path.join(dir, entry.name);
      if (fs.existsSync(path.join(fullPath, "package.json"))) {
        dirs.push(fullPath);
      }
      if (isDeep && depth < 2) scanDir(fullPath, depth + 1);
    }
  }

  scanDir(base, 0);
  return dirs;
}

// ── 3. Determine correct typecheck command ────────────────────────────────────

function typecheckCmd(pkgDir) {
  if (fs.existsSync(path.join(pkgDir, "tsconfig.json"))) return "tsc --noEmit";
  return null;
}

// ── 4. Main ───────────────────────────────────────────────────────────────────

const workspaceGlobs = parseWorkspaceYaml();
console.log("Workspace globs:", workspaceGlobs);

const allPackageDirs = [];
for (const g of workspaceGlobs) {
  allPackageDirs.push(...expandGlob(g));
}

// Deduplicate
const unique = [...new Map(allPackageDirs.map(d => [d, d])).values()];
console.log(`Found ${unique.length} workspace packages\n`);

let patched = 0;
let skipped = 0;
const patchLog = [];
const skipReasons = { noTsconfig: [], alreadyHas: [], parseError: [] };

for (const pkgDir of unique) {
  const pkgJsonPath = path.join(pkgDir, "package.json");
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  } catch {
    skipReasons.parseError.push(path.relative(ROOT, pkgDir));
    skipped++;
    continue;
  }

  const scripts = pkg.scripts ?? {};
  const tc = typecheckCmd(pkgDir);
  const changes = [];

  if (!tc) {
    skipReasons.noTsconfig.push(path.relative(ROOT, pkgDir));
    skipped++;
    continue;
  }

  if (!scripts.typecheck) {
    scripts.typecheck = tc;
    changes.push(`typecheck: "${tc}"`);
  }

  if (changes.length > 0) {
    pkg.scripts = scripts;
    const label = path.relative(ROOT, pkgDir);
    patchLog.push(`✓ ${label}: ${changes.join(", ")}`);
    if (!DRY_RUN) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n");
    }
    patched++;
  } else {
    skipReasons.alreadyHas.push(path.relative(ROOT, pkgDir));
    skipped++;
  }
}

console.log("=== PATCHES" + (DRY_RUN ? " (DRY RUN)" : "") + " ===");
for (const l of patchLog) console.log(l);

console.log(`\n=== ALREADY HAD TYPECHECK (${skipReasons.alreadyHas.length}) ===`);
for (const l of skipReasons.alreadyHas) console.log(`  ${l}`);

console.log(`\n=== NO TSCONFIG — SKIPPED (${skipReasons.noTsconfig.length}) ===`);
for (const l of skipReasons.noTsconfig) console.log(`  ${l}`);

if (skipReasons.parseError.length) {
  console.log(`\n=== PARSE ERRORS (${skipReasons.parseError.length}) ===`);
  for (const l of skipReasons.parseError) console.log(`  ${l}`);
}

console.log(`\nSummary: ${patched} patched, ${skipped} skipped${DRY_RUN ? " [DRY RUN]" : ""}`);
