#!/usr/bin/env node
/**
 * scripts/audit-workspace-contracts.mjs
 *
 * KRN-CI-001 / W0.2 — fail-closed workspace validation.
 *
 * Classifies every pnpm workspace package (apps/*, packages/*,
 * packages/capabilities/*, services/*) and fails CI when a SOURCE_PACKAGE
 * is missing a required real script, or when any package uses a prohibited
 * no-op (`exit 0`, `true`, `echo no tests`).
 *
 * WAVE-0 “as applicable” (do not invent dummy scripts):
 *   typecheck — required when tsconfig.json exists
 *   lint      — required when an ESLint config already exists
 *   test      — required when test files exist (*.test.* / *.spec.*)
 *   build     — required when the package is actually built (Next/Vite
 *               app, or main/types/exports point at dist/)
 *
 * Ignores .codex-task8-* and .worktrees.
 * Dummy scripts for all 141 packages are not the fix — exemptions are
 * explicit YAML with a reason; expiry null is allowed only for
 * GENERATED_PACKAGE / fixture packages.
 *
 * Emits:
 *   PACKAGE  TYPE  TYPECHECK  LINT  TEST  BUILD  EXEMPTION  EXEMPTION_REASON  EXPIRY
 *
 * Usage:
 *   node scripts/audit-workspace-contracts.mjs
 *   pnpm repo:policy
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EXEMPTIONS_PATH = path.join(ROOT, "scripts/workspace-contract-exemptions.yaml");

const SCRIPT_KEYS = ["typecheck", "lint", "test", "build"];
const PACKAGE_TYPES = new Set([
  "SOURCE_PACKAGE",
  "GENERATED_PACKAGE",
  "CONFIG_PACKAGE",
  "DOCS_PACKAGE",
  "META_PACKAGE",
]);

const ESLINT_CONFIGS = [
  "eslint.config.js", "eslint.config.mjs", "eslint.config.ts", "eslint.config.cjs",
  ".eslintrc.js", ".eslintrc.cjs", ".eslintrc.json", ".eslintrc.yml", ".eslintrc.yaml",
];
const TEST_CONFIGS = [
  "vitest.config.ts", "vitest.config.js", "vitest.config.mjs",
  "jest.config.ts", "jest.config.js", "jest.config.mjs", "jest.config.json",
];

const SKIP_DIR_NAMES = new Set([
  "node_modules", "dist", "build", "coverage", ".next", ".turbo", ".git",
]);

// ── IO helpers ────────────────────────────────────────────────────────────────

function exists(...parts) {
  return fs.existsSync(path.join(...parts));
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function posixRel(from, to) {
  return path.relative(from, to).split(path.sep).join("/");
}

// ── Workspace discovery ───────────────────────────────────────────────────────

function parseWorkspaceGlobs() {
  const yaml = fs.readFileSync(path.join(ROOT, "pnpm-workspace.yaml"), "utf8");
  const globs = [];
  let inPkgs = false;
  for (const raw of yaml.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "packages:") {
      inPkgs = true;
      continue;
    }
    if (inPkgs && line.startsWith("-")) {
      const m = line.match(/^-\s*["']?([^"'#]+?)["']?\s*$/);
      if (m) globs.push(m[1].trim());
    } else if (
      inPkgs &&
      line &&
      !raw.startsWith(" ") &&
      !raw.startsWith("\t") &&
      !line.startsWith("#")
    ) {
      inPkgs = false;
    }
  }
  return globs;
}

function shouldSkipDirName(name) {
  if (SKIP_DIR_NAMES.has(name)) return true;
  if (name.startsWith(".")) return true;
  if (name.startsWith(".codex-task8")) return true;
  if (name === ".worktrees") return true;
  return false;
}

function collectPackages(globPattern) {
  const isDeep = globPattern.endsWith("/**");
  const base = path.join(ROOT, globPattern.replace(/\/\*\*?$/, ""));
  const pkgs = [];

  function scan(dir, depth) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory() || shouldSkipDirName(e.name)) continue;
      const full = path.join(dir, e.name);
      if (exists(full, "package.json")) pkgs.push(full);
      if (isDeep && depth < 2) scan(full, depth + 1);
    }
  }

  if (fs.existsSync(base)) scan(base, 0);
  return pkgs;
}

function listWorkspacePackages() {
  const globs = parseWorkspaceGlobs();
  const dirs = [...new Set(globs.flatMap(collectPackages))];
  dirs.sort((a, b) => posixRel(ROOT, a).localeCompare(posixRel(ROOT, b)));
  return dirs;
}

// ── YAML (constrained) ────────────────────────────────────────────────────────

function parseScalar(raw) {
  const v = String(raw).trim();
  if (v === "null" || v === "~" || v === "") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  if (v.startsWith("[") && v.endsWith("]")) {
    return v
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseScalar(s));
  }
  return v;
}

function parseConstrainedYaml(text) {
  return parseConstrainedYamlPass2(text);
}

function parseConstrainedYamlPass2(text) {
  const lines = [];
  for (const raw of text.split(/\r?\n/)) {
    const cut = raw.replace(/#.*$/, "");
    if (!cut.trim()) continue;
    lines.push({
      indent: raw.match(/^ */)[0].length,
      text: cut.trimEnd(),
      trim: cut.trim(),
    });
  }

  function parseBlock(start, parentIndent) {
    const map = {};
    const list = [];
    let i = start;
    let mode = null;

    while (i < lines.length) {
      const { indent, trim } = lines[i];
      if (indent <= parentIndent) break;

      if (trim.startsWith("- ")) {
        if (mode === "map") throw new Error(`Mixed map/list at ${trim}`);
        mode = "list";
        const rest = trim.slice(2);
        const colon = rest.indexOf(":");
        if (colon > 0 && !rest.startsWith("[") && !rest.startsWith("{")) {
          const key = rest.slice(0, colon).trim();
          const val = rest.slice(colon + 1).trim();
          const item = {};
          if (val === "") {
            const [child, next] = parseBlock(i + 1, indent);
            item[key] = child;
            i = next;
          } else {
            item[key] = parseScalar(val);
            i += 1;
            if (i < lines.length && lines[i].indent > indent && !lines[i].trim.startsWith("- ")) {
              const [child, next] = parseBlock(i, indent);
              Object.assign(item, child);
              i = next;
            }
          }
          list.push(item);
          continue;
        }
        list.push(parseScalar(rest));
        i += 1;
        continue;
      }

      if (mode === "list") throw new Error(`Mixed list/map at ${trim}`);
      mode = "map";
      const colon = trim.indexOf(":");
      if (colon < 0) throw new Error(`YAML line missing ':': ${trim}`);
      const key = trim.slice(0, colon).trim();
      const val = trim.slice(colon + 1).trim();
      if (val === "") {
        const [child, next] = parseBlock(i + 1, indent);
        map[key] = child;
        i = next;
      } else {
        map[key] = parseScalar(val);
        i += 1;
      }
    }

    if (mode === "list") return [list, i];
    return [map, i];
  }

  const [doc] = parseBlock(0, -1);
  return doc;
}

function loadExemptions() {
  if (!fs.existsSync(EXEMPTIONS_PATH)) {
    throw new Error(`Missing exemptions file: ${posixRel(ROOT, EXEMPTIONS_PATH)}`);
  }
  const doc = parseConstrainedYaml(fs.readFileSync(EXEMPTIONS_PATH, "utf8"));
  const packageTypes = doc.package_types ?? {};
  const exemptions = Array.isArray(doc.exemptions) ? doc.exemptions : [];

  for (const [pkg, type] of Object.entries(packageTypes)) {
    if (!PACKAGE_TYPES.has(type)) {
      throw new Error(`Unknown package type for ${pkg}: ${type}`);
    }
  }

  const byPackage = new Map();
  const metaErrors = [];
  for (const row of exemptions) {
    if (!row || typeof row !== "object") continue;
    const pkg = row.package;
    if (!pkg) {
      metaErrors.push("exemption row missing package");
      continue;
    }
    const scripts = Array.isArray(row.scripts) ? row.scripts : [];
    byPackage.set(pkg, {
      scripts: new Set(scripts),
      reason: row.reason ?? "",
      expiry: row.expiry ?? null,
    });
  }
  return { packageTypes, byPackage, metaErrors };
}

function exemptionActive(row, classifiedType, today = new Date()) {
  if (!row) return false;
  if (row.expiry === null || row.expiry === undefined) {
    return classifiedType === "GENERATED_PACKAGE";
  }
  const expiry = new Date(`${row.expiry}T23:59:59.000Z`);
  if (Number.isNaN(expiry.getTime())) return false;
  return today.getTime() <= expiry.getTime();
}

// ── Classification ────────────────────────────────────────────────────────────

function walkFiles(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (shouldSkipDirName(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function inspectPackage(pkgDir) {
  const files = walkFiles(pkgDir);
  const relFiles = files.map((f) => posixRel(pkgDir, f));
  const hasTsconfig = exists(pkgDir, "tsconfig.json");
  const hasEslint = ESLINT_CONFIGS.some((f) => exists(pkgDir, f));
  const hasTestConfig =
    TEST_CONFIGS.some((f) => exists(pkgDir, f)) ||
    Boolean(readJson(path.join(pkgDir, "package.json"))?.jest);
  const tsFiles = relFiles.filter((f) => /\.(ts|tsx|mts|cts)$/.test(f) && !f.endsWith(".d.ts"));
  const jsFiles = relFiles.filter((f) => /\.(js|jsx|mjs|cjs)$/.test(f));
  const testFiles = relFiles.filter((f) => /\.(test|spec)\.(ts|tsx|js|mjs|cjs)$/.test(f));
  const authored = relFiles.filter((f) => f !== "package.json" && f !== "README.md" && f !== "LICENSE");
  return {
    hasTsconfig,
    hasEslint,
    hasTestConfig,
    tsFileCount: tsFiles.length,
    jsFileCount: jsFiles.length,
    hasTypeScript: hasTsconfig || tsFiles.length > 0,
    hasTestFiles: testFiles.length > 0,
    authoredCount: authored.length,
    onlyManifest: authored.length === 0,
  };
}

function classifyPackage(rel, pkg, inspect, typeOverrides) {
  if (typeOverrides[rel] && PACKAGE_TYPES.has(typeOverrides[rel])) {
    return typeOverrides[rel];
  }
  const name = pkg?.name ?? "";
  const base = rel.split("/").pop() ?? "";
  if (
    inspect.onlyManifest ||
    /(^|\/)icons-(ai|angular|cli|core|figma|react|vue|web)$/.test(rel)
  ) {
    return "GENERATED_PACKAGE";
  }
  if (/(generated|fixture|fixtures)/i.test(name) || /(generated|fixture|fixtures)/i.test(base)) {
    return "GENERATED_PACKAGE";
  }
  if (/(eslint-config|prettier-config|^tsconfig$|tsconfig-)/i.test(name) || /eslint-config|prettier-config/.test(base)) {
    return "CONFIG_PACKAGE";
  }
  if (/(^@[^/]+\/)?docs(-|$)|documentation/i.test(name) || /^(docs|documentation)$/i.test(base)) {
    return "DOCS_PACKAGE";
  }
  if (inspect.tsFileCount === 0 && inspect.jsFileCount === 0 && inspect.authoredCount <= 2) {
    return "META_PACKAGE";
  }
  if (!inspect.hasTypeScript && inspect.authoredCount <= 1 && !pkg?.scripts) {
    return "META_PACKAGE";
  }
  return "SOURCE_PACKAGE";
}

function isBuiltPackage(pkgDir, pkg) {
  const buildMarkers = [
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "next.config.cjs",
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mjs",
  ];
  if (buildMarkers.some((f) => exists(pkgDir, f))) return true;
  const main = String(pkg?.main ?? "");
  const types = String(pkg?.types ?? "");
  if (/^\.?\/?dist\//.test(main) || /^\.?\/?dist\//.test(types)) return true;
  if (pkg?.exports) {
    const dumped = JSON.stringify(pkg.exports);
    if (dumped.includes("/dist/") || dumped.includes("\"./dist")) return true;
  }
  return false;
}

function requiredScripts(type, inspect, pkg, pkgDir) {
  const required = new Set();
  if (type !== "SOURCE_PACKAGE") return required;
  // Typecheck is applicable when tsconfig.json exists — not merely because
  // a .ts file is present without a compiler project.
  if (inspect.hasTsconfig) required.add("typecheck");
  // Lint is applicable when an ESLint config already exists in the package.
  if (inspect.hasEslint) required.add("lint");
  // Test is applicable when test files exist. A vitest/jest config with zero
  // tests does not force a dummy "echo no tests" script (WAVE-0 as applicable).
  if (inspect.hasTestFiles) required.add("test");
  // Build is applicable when the package is actually built.
  if (isBuiltPackage(pkgDir, pkg)) required.add("build");
  return required;
}

function isNoop(command) {
  if (command == null) return false;
  const normalized = String(command).trim().replace(/\s+/g, " ").toLowerCase();
  if (normalized === "exit 0" || normalized === "exit 0;") return true;
  if (normalized === "true" || normalized === ":") return true;
  if (normalized === "echo no tests") return true;
  if (/^echo\s+(['"]?)no tests\1$/.test(normalized)) return true;
  return false;
}

function evaluateScript(command, required) {
  if (isNoop(command)) return "FAIL";
  if (command) return "PASS";
  if (required) return "FAIL";
  return "N/A";
}

// ── Table ─────────────────────────────────────────────────────────────────────

function pad(value, width) {
  const s = String(value ?? "");
  if (s.length >= width) return s;
  return s + " ".repeat(width - s.length);
}

function printTable(rows) {
  const headers = [
    "PACKAGE",
    "TYPE",
    "TYPECHECK",
    "LINT",
    "TEST",
    "BUILD",
    "EXEMPTION",
    "EXEMPTION_REASON",
    "EXPIRY",
  ];
  const widths = headers.map((h) => h.length);
  for (const row of rows) {
    headers.forEach((h, i) => {
      widths[i] = Math.max(widths[i], String(row[h] ?? "").length);
    });
  }
  const line = (values) => values.map((v, i) => pad(v, widths[i])).join("  ");
  console.log(line(headers));
  for (const row of rows) {
    console.log(line(headers.map((h) => row[h])));
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  if (process.argv.includes("--fix")) {
    console.error("audit-workspace-contracts: --fix is disabled (dummy-scripting is not the W0.2 fix).");
  }

  const { packageTypes, byPackage, metaErrors } = loadExemptions();
  const dirs = listWorkspacePackages();
  const rows = [];
  const failures = [...metaErrors];
  const invalidNullExpiry = [];

  console.log(`\nKRN-CI-001 workspace contract audit — ${dirs.length} packages\n`);

  for (const pkgDir of dirs) {
    const rel = posixRel(ROOT, pkgDir);
    const pkg = readJson(path.join(pkgDir, "package.json")) ?? {};
    const inspect = inspectPackage(pkgDir);
    const type = classifyPackage(rel, pkg, inspect, packageTypes);
    const required = requiredScripts(type, inspect, pkg, pkgDir);
    const scripts = pkg.scripts ?? {};
    const exemption = byPackage.get(rel);
    const active = exemptionActive(exemption, type);

    if (exemption && (exemption.expiry === null || exemption.expiry === undefined) && type !== "GENERATED_PACKAGE") {
      invalidNullExpiry.push(rel);
      failures.push(`${rel}: expiry null is only allowed for GENERATED_PACKAGE / fixture packages`);
    }

    const statuses = {};
    const exemptedScripts = [];
    for (const key of SCRIPT_KEYS) {
      let status = evaluateScript(scripts[key], required.has(key));
      if (status === "FAIL" && active && exemption.scripts.has(key)) {
        status = "EXEMPT";
        exemptedScripts.push(key);
      } else if (status === "FAIL") {
        const why = isNoop(scripts[key])
          ? `no-op ${key}: ${JSON.stringify(scripts[key])}`
          : `missing required ${key}`;
        failures.push(`${rel} [${type}] ${why}`);
      }
      statuses[key] = status;
    }

    const exemptionFlag = exemptedScripts.length > 0 || (active && exemption) ? "YES" : "NO";
    rows.push({
      PACKAGE: rel,
      TYPE: type,
      TYPECHECK: statuses.typecheck,
      LINT: statuses.lint,
      TEST: statuses.test,
      BUILD: statuses.build,
      EXEMPTION: exemptionFlag,
      EXEMPTION_REASON: active && exemption ? exemption.reason : "—",
      EXPIRY: active && exemption ? (exemption.expiry === null ? "null" : exemption.expiry) : "—",
    });
  }

  printTable(rows);
  console.log("");

  if (invalidNullExpiry.length > 0) {
    console.error(`Invalid null expiry on non-generated packages: ${invalidNullExpiry.join(", ")}`);
  }

  if (failures.length > 0) {
    const byKind = { typecheck: 0, lint: 0, test: 0, build: 0, noop: 0, other: 0 };
    for (const f of failures) {
      if (/no-op /.test(f)) byKind.noop += 1;
      else if (/missing required typecheck/.test(f)) byKind.typecheck += 1;
      else if (/missing required lint/.test(f)) byKind.lint += 1;
      else if (/missing required test/.test(f)) byKind.test += 1;
      else if (/missing required build/.test(f)) byKind.build += 1;
      else byKind.other += 1;
    }
    console.error(`FAIL  ${failures.length} workspace contract violation(s):\n`);
    for (const f of failures) console.error(`  - ${f}`);
    console.error("");
    console.error(
      `By kind: no-op=${byKind.noop} missing-typecheck=${byKind.typecheck} missing-lint=${byKind.lint} missing-test=${byKind.test} missing-build=${byKind.build} other=${byKind.other}`
    );
    console.error("");
    process.exit(1);
  }

  console.log(`PASS  ${dirs.length} packages satisfy workspace contracts.\n`);
  process.exit(0);
}

main();
