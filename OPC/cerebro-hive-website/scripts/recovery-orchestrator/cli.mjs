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
  evidenceStore: new EvidenceStore(evidenceDir),
  ledger: new RecoveryLedger(ledgerFile),
  maxIterations: Number(env("RECOVERY_MAX_ITERATIONS", "50")),
  initialState: {
    portfolio: "Cerebro Nexarch",
    wave: env("RECOVERY_WAVE", "W0.2"),
    status: "ACTIVE",
    canonicalBaseSha: env("RECOVERY_BASE_SHA", "UNKNOWN"),
    repository,
    constitutionPath,
    createdAt: new Date().toISOString(),
  },
});

const once = process.argv.includes("--once");
const state = await orchestrator.run({ once });
process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
process.exit(state.status === "FROZEN" || state.status === "BLOCKED" ? 2 : 0);
