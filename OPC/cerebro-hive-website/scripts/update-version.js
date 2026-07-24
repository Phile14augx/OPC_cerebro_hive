#!/usr/bin/env node
// =============================================================================
// CerebroHive — update-version.js
// Called by semantic-release prepareCmd: node scripts/update-version.js <version>
//
// Updates version fields in:
//   - package.json (root)
//   - apps/*/package.json
//   - packages/*/package.json
//   - infra/helm/cerebro-hive/Chart.yaml (appVersion)
// =============================================================================

const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version) {
  console.error('Usage: update-version.js <version>');
  process.exit(1);
}

console.log(`Updating CerebroHive to v${version}`);

const ROOT = path.resolve(__dirname, '..');

// ── Helper: read/write JSON ────────────────────────────────────────────────

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
}

// ── Helper: update appVersion in Chart.yaml ────────────────────────────────

function updateChartYaml(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replace(/^appVersion:.*$/m, `appVersion: "${version}"`)
    .replace(/^version:.*$/m, (match) => {
      // Increment chart version patch on every release
      const [major, minor, patch] = match.replace('version:', '').trim().split('.').map(Number);
      return `version: ${major}.${minor}.${patch + 1}`;
    });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
}

// ── Update package.json files ──────────────────────────────────────────────

const packageJsonPaths = [
  path.join(ROOT, 'package.json'),
  ...glob(path.join(ROOT, 'apps'), 'package.json'),
  ...glob(path.join(ROOT, 'packages'), 'package.json'),
];

let updated = 0;
for (const filePath of packageJsonPaths) {
  const pkg = readJSON(filePath);
  if (!pkg) continue;
  if (pkg.version === undefined) continue; // skip workspaces root stubs without version
  pkg.version = version;
  writeJSON(filePath, pkg);
  updated++;
}

// ── Update Helm Chart.yaml ─────────────────────────────────────────────────

updateChartYaml(path.join(ROOT, 'infra', 'helm', 'cerebro-hive', 'Chart.yaml'));

// ── Summary ───────────────────────────────────────────────────────────────

console.log(`\nDone. Updated ${updated} package.json file(s) + Helm chart to v${version}`);

// ── Tiny glob helper (no dependencies) ────────────────────────────────────

function glob(dir, filename) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(dir, entry.name, filename);
    if (fs.existsSync(candidate)) results.push(candidate);
  }
  return results;
}
