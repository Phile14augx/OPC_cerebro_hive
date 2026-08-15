#!/usr/bin/env node
/**
 * scripts/repo-policy.mjs
 *
 * KRN-CI-001: delegates to scripts/audit-workspace-contracts.mjs so
 * `pnpm repo:policy` is fail-closed (classification + no-op prohibition +
 * explicit YAML exemptions). Dummy-script --fix is not supported.
 *
 * Usage:
 *   node scripts/repo-policy.mjs
 *   pnpm repo:policy
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const audit = path.join(__dirname, "audit-workspace-contracts.mjs");
const extra = process.argv.slice(2);

const result = spawnSync(process.execPath, [audit, ...extra], {
  stdio: "inherit",
});

process.exit(result.status === null ? 1 : result.status);
