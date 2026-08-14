#!/usr/bin/env node
/**
 * Extends the 99-item nav registry audit with P0 marketing, auth, and archive links.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const failures = [];

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function contains(rel, needle) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8").includes(needle);
}

const nav = spawnSync(process.execPath, [path.join(ROOT, "scripts/audit-nav-routes.mjs")], { encoding: "utf8" });
if (nav.status !== 0) {
  failures.push(`NAV_REGISTRY: ${nav.stdout || nav.stderr}`);
}

if (contains("apps/studio/app/(auth)/login/page.tsx", "router.push('/dashboard')")) {
  failures.push("AUTH_REDIRECT: login still targets missing /dashboard");
}
if (contains("apps/studio/app/(auth)/register/page.tsx", "router.push('/dashboard')")) {
  failures.push("AUTH_REDIRECT: register still targets missing /dashboard");
}
if (contains("apps/studio/lib/data/navigation.ts", 'href: "/docs"')) {
  failures.push("DOCS_404: marketing nav still points at /docs");
}
if (contains("apps/studio/app/(platform)/app/page.tsx", "/app/ai/agents/new")) {
  failures.push("QUICK_ACTION: dashboard Create Agent uses an unregistered href");
}
for (const rel of [
  "apps/studio/app/(platform)/archive/models/page.tsx",
  "apps/studio/app/(platform)/archive/datasets/page.tsx",
  "apps/archive-portal/app/search/page.tsx",
  "apps/archive-portal/app/admin/page.tsx",
]) {
  if (!exists(rel)) failures.push(`MISSING_PAGE: ${rel}`);
}

if (contains("apps/studio/app/(platform)/app/runtime/page.tsx", "mockExecutions")) {
  failures.push("FAKE_UI: runtime dashboard still ships fabricated executions");
}
if (contains("apps/studio/lib/talent/infrastructure/execution/providers/MockProviders.ts", "eval(")) {
  failures.push("FAKE_UI: Talent mock sandbox still evals candidate code");
}
if (contains("apps/studio/app/(platform)/app/forge/review/page.tsx", "Auto-fix {autoFixable} Issues")) {
  failures.push("FAKE_UI: Forge review still offers a working Auto-fix action");
}

if (failures.length) {
  console.error(`audit-route-health: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}

console.log("audit-route-health: PASS");
process.exit(0);
