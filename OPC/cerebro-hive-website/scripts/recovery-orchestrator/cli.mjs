#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { QwenGovernorAdapter } from "./governor.mjs";
import { LocalShellExecutor, HttpExecutorAdapter } from "./executor.mjs";
import { RecoveryPolicyEngine } from "./policy.mjs";
import { GitGuard } from "./git-guard.mjs";
import { EvidenceStore } from "./evidence-store.mjs";
import { RecoveryLedger } from "./ledger.mjs";
import { RecoveryOrchestrator } from "./orchestrator.mjs";
import { reconcileFalsePositiveFreeze } from "./freeze-reconciliation.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(here, "../..");

function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

const repository = path.resolve(env("RECOVERY_REPOSITORY", path.resolve(workspaceRoot, "../..")));
const stateDir = path.resolve(env("RECOVERY_STATE_DIR", path.join(repository, "..", "CEREBRO_RECOVERY_ORCHESTRATOR")));
const evidenceDir = path.join(stateDir, "evidence");
const ledgerFile = path.join(stateDir, "recovery-ledger.jsonl");
const executorMode = env("RECOVERY_EXECUTOR", "local");
const constitutionPath = path.resolve(env("RECOVERY_CONSTITUTION_FILE", path.join(here, "constitution.md")));
const systemPrompt = fs.readFileSync(constitutionPath, "utf8");

const initialState = {
  portfolio: "Cerebro Nexarch",
  wave: env("RECOVERY_WAVE", "W0.2"),
  status: "ACTIVE",
  canonicalBaseSha: env("RECOVERY_BASE_SHA", "UNKNOWN"),
  pr42HeadSha: env("RECOVERY_PR42_HEAD_SHA", "") || undefined,
  repository,
  constitutionPath,
  createdAt: new Date().toISOString(),
};

const evidenceStore = new EvidenceStore(evidenceDir);
const ledger = new RecoveryLedger(ledgerFile);
const persistedState = await ledger.latestState(initialState);

if (process.argv.includes("--reconcile-freeze")) {
  try {
    const state = await reconcileFalsePositiveFreeze({
      state: persistedState,
      evidenceStore,
      ledger,
      expectedSha256: env("RECOVERY_RECONCILE_FREEZE_SHA256", ""),
    });
    process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
    process.exit(0);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(2);
  }
}

// A freeze is a hard stop. The governor must not be invoked again until an
// explicit, evidence-bound reconciliation has appended a new ledger state.
if (persistedState.status === "FROZEN") {
  process.stdout.write(`${JSON.stringify(persistedState, null, 2)}\n`);
  process.exit(2);
}

const governor = new QwenGovernorAdapter({
  baseUrl: env("QWEN_BASE_URL"),
  apiKey: env("QWEN_API_KEY"),
  model: env("QWEN_MODEL"),
  apiStyle: env("QWEN_API_STYLE", "auto"),
  systemPrompt,
});

const executor = executorMode === "http"
  ? new HttpExecutorAdapter({
      executeUrl: env("LAGUNA_EXECUTE_URL"),
      apiKey: env("LAGUNA_API_KEY"),
    })
  : new LocalShellExecutor({ timeoutMs: Number(env("RECOVERY_COMMAND_TIMEOUT_MS", "120000")) });

const orchestrator = new RecoveryOrchestrator({
  governor,
  executor,
  policy: new RecoveryPolicyEngine({
    allowPush: env("RECOVERY_ALLOW_PUSH", "false") === "true",
    allowShell: false,
  }),
  gitGuard: new GitGuard({ git: env("GIT_EXE", "git") }),
  evidenceStore,
  ledger,
  maxIterations: Number(env("RECOVERY_MAX_ITERATIONS", "50")),
  allowClosureProposal: env("RECOVERY_ALLOW_CLOSURE_PROPOSAL", "false") === "true",
  initialState,
});

const once = process.argv.includes("--once");
const state = await orchestrator.run({ once });
process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
process.exit(["FROZEN", "BLOCKED", "EXECUTION_FAILED"].includes(state.status) ? 2 : 0);
