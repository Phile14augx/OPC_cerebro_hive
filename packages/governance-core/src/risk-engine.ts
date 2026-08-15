// ============================================================
// governance-core/src/risk-engine.ts
// ============================================================

import { DataClassification, RiskLevel, RiskScore } from "./types";

export interface RiskContext {
  agentType?: string;
  agentRiskLevel?: RiskLevel;
  action: string;
  toolName?: string;
  dataClassification?: DataClassification;
  financialImpact?: number;
  isExternalSideEffect?: boolean;
  permissionLevel?: string;
  hasApproval?: boolean;
}

// Numeric ordering for data classification levels
const DATA_CLASSIFICATION_RANK: Record<DataClassification, number> = {
  public: 0,
  internal: 1,
  confidential: 2,
  restricted: 3,
  secret: 4,
};

// Actions that are inherently risky
const HIGH_RISK_ACTIONS = new Set([
  "delete",
  "destroy",
  "drop",
  "truncate",
  "purge",
  "wipe",
  "format",
  "rm",
  "unlink",
  "overwrite",
]);

const MEDIUM_RISK_ACTIONS = new Set([
  "write",
  "update",
  "modify",
  "patch",
  "put",
  "post",
  "create",
  "deploy",
  "execute",
  "run",
  "invoke",
]);

function scoreFromAgentRiskLevel(level: RiskLevel | undefined): number {
  switch (level) {
    case "low":
      return 10;
    case "medium":
      return 30;
    case "high":
      return 60;
    case "critical":
      return 90;
    default:
      return 20; // unknown agent type, assume low-medium
  }
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export class RiskEngine {
  score(context: RiskContext): RiskScore {
    const factors: string[] = [];
    let total = 0;

    // ── Base score from agent risk level ──────────────────────────────────
    const base = scoreFromAgentRiskLevel(context.agentRiskLevel);
    total += base;
    factors.push(
      `Agent risk level "${context.agentRiskLevel ?? "unknown"}": +${base}`
    );

    // ── External side effects ─────────────────────────────────────────────
    if (context.isExternalSideEffect === true) {
      total += 10;
      factors.push("External side effect detected: +10");
    }

    // ── Financial impact ──────────────────────────────────────────────────
    if (
      context.financialImpact !== undefined &&
      context.financialImpact > 10_000
    ) {
      const financialBonus = context.financialImpact > 100_000 ? 30 : 20;
      total += financialBonus;
      factors.push(
        `Financial impact $${context.financialImpact.toLocaleString()} exceeds threshold: +${financialBonus}`
      );
    }

    // ── Data classification ───────────────────────────────────────────────
    if (context.dataClassification !== undefined) {
      const rank = DATA_CLASSIFICATION_RANK[context.dataClassification];
      if (rank >= DATA_CLASSIFICATION_RANK["confidential"]) {
        total += 30;
        factors.push(
          `Data classification "${context.dataClassification}" is confidential or above: +30`
        );
      } else if (rank >= DATA_CLASSIFICATION_RANK["internal"]) {
        total += 5;
        factors.push(
          `Data classification "${context.dataClassification}" is internal: +5`
        );
      }
    }

    // ── Action risk ───────────────────────────────────────────────────────
    const actionLower = context.action.toLowerCase();
    if ([...HIGH_RISK_ACTIONS].some((a) => actionLower.includes(a))) {
      total += 20;
      factors.push(`Action "${context.action}" is high-risk (destructive): +20`);
    } else if (
      [...MEDIUM_RISK_ACTIONS].some((a) => actionLower.includes(a))
    ) {
      total += 5;
      factors.push(
        `Action "${context.action}" is medium-risk (write/modify): +5`
      );
    }

    // ── Approval status ───────────────────────────────────────────────────
    if (context.hasApproval === true) {
      total -= 20;
      factors.push("Approved action: -20");
    } else {
      // Penalise high-risk actions that lack approval
      const projectedLevel = levelFromScore(total);
      if (projectedLevel === "high" || projectedLevel === "critical") {
        total += 15;
        factors.push(
          "High-risk action without approval: +15"
        );
      }
    }

    // ── Permission level ──────────────────────────────────────────────────
    if (context.permissionLevel === "elevated" || context.permissionLevel === "admin") {
      total += 10;
      factors.push(`Elevated permission level "${context.permissionLevel}": +10`);
    }

    // ── Clamp to 0-100 ────────────────────────────────────────────────────
    const clamped = Math.max(0, Math.min(100, total));
    const level = levelFromScore(clamped);

    return {
      score: clamped,
      level,
      factors,
    };
  }
}
