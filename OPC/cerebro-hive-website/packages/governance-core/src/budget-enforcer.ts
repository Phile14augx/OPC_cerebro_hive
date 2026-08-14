// ============================================================
// governance-core/src/budget-enforcer.ts
// ============================================================

import {
  BudgetAccount,
  BudgetAccountType,
  BudgetAction,
  BudgetCheckResult,
  BudgetPeriod,
  ResourceUsage,
} from "./types";

function generateId(): string {
  return `acct_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface BudgetAccountConfig {
  tenantId: string;
  workspaceId?: string;
  agentId?: string;
  missionId?: string;
  type: BudgetAccountType;
  tokenBudget?: number;
  costBudgetUsd?: number;
  executionTimeBudget?: number; // ms
  period?: BudgetPeriod;
}

export class BudgetEnforcer {
  static readonly WARN_THRESHOLD = 0.8;
  static readonly THROTTLE_THRESHOLD = 0.9;
  static readonly DENY_THRESHOLD = 1.0;

  // Default budget ceilings when not specified
  private static readonly DEFAULT_TOKEN_BUDGET = 1_000_000;
  private static readonly DEFAULT_COST_BUDGET_USD = 100;
  private static readonly DEFAULT_EXECUTION_TIME_BUDGET_MS = 3_600_000; // 1 hour

  private accounts: Map<string, BudgetAccount> = new Map();

  createAccount(config: BudgetAccountConfig): BudgetAccount {
    const now = new Date().toISOString();
    const period: BudgetPeriod = config.period ?? "monthly";

    const account: BudgetAccount = {
      accountId: generateId(),
      tenantId: config.tenantId,
      workspaceId: config.workspaceId,
      agentId: config.agentId,
      missionId: config.missionId,
      type: config.type,
      tokenBudget:
        config.tokenBudget ?? BudgetEnforcer.DEFAULT_TOKEN_BUDGET,
      costBudgetUsd:
        config.costBudgetUsd ?? BudgetEnforcer.DEFAULT_COST_BUDGET_USD,
      executionTimeBudget:
        config.executionTimeBudget ??
        BudgetEnforcer.DEFAULT_EXECUTION_TIME_BUDGET_MS,
      tokenUsed: 0,
      costUsed: 0,
      executionTimeUsed: 0,
      period,
      resetAt: this.computeResetAt(period),
      createdAt: now,
      updatedAt: now,
    };

    this.accounts.set(account.accountId, account);
    return { ...account };
  }

  private computeResetAt(period: BudgetPeriod): string | undefined {
    const now = new Date();
    switch (period) {
      case "daily": {
        const next = new Date(now);
        next.setUTCDate(next.getUTCDate() + 1);
        next.setUTCHours(0, 0, 0, 0);
        return next.toISOString();
      }
      case "monthly": {
        const next = new Date(now);
        next.setUTCMonth(next.getUTCMonth() + 1, 1);
        next.setUTCHours(0, 0, 0, 0);
        return next.toISOString();
      }
      case "mission":
      case "unlimited":
        return undefined;
    }
  }

  getAccount(accountId: string): BudgetAccount {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error(`Budget account not found: ${accountId}`);
    return { ...account };
  }

  listAccounts(
    filters?: Partial<
      Pick<
        BudgetAccount,
        "tenantId" | "workspaceId" | "agentId" | "missionId" | "type"
      >
    >
  ): BudgetAccount[] {
    let accounts = Array.from(this.accounts.values());
    if (!filters) return accounts.map((a) => ({ ...a }));

    if (filters.tenantId !== undefined) {
      accounts = accounts.filter((a) => a.tenantId === filters.tenantId);
    }
    if (filters.workspaceId !== undefined) {
      accounts = accounts.filter((a) => a.workspaceId === filters.workspaceId);
    }
    if (filters.agentId !== undefined) {
      accounts = accounts.filter((a) => a.agentId === filters.agentId);
    }
    if (filters.missionId !== undefined) {
      accounts = accounts.filter((a) => a.missionId === filters.missionId);
    }
    if (filters.type !== undefined) {
      accounts = accounts.filter((a) => a.type === filters.type);
    }

    return accounts.map((a) => ({ ...a }));
  }

  /**
   * Check whether a usage increment is within budget.
   * Does NOT mutate the account — call recordUsage() separately.
   */
  checkBudget(
    accountId: string,
    usage: Partial<ResourceUsage>
  ): BudgetCheckResult {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error(`Budget account not found: ${accountId}`);

    // Auto-reset if the reset window has elapsed
    this.maybeReset(account);

    const tokens = usage.tokens ?? 0;
    const costUsd = usage.costUsd ?? 0;
    const executionTimeMs = usage.executionTimeMs ?? 0;

    const projectedTokens = account.tokenUsed + tokens;
    const projectedCost = account.costUsed + costUsd;
    const projectedTime = account.executionTimeUsed + executionTimeMs;

    const tokenUtil =
      account.tokenBudget > 0
        ? projectedTokens / account.tokenBudget
        : 0;
    const costUtil =
      account.costBudgetUsd > 0
        ? projectedCost / account.costBudgetUsd
        : 0;
    const timeUtil =
      account.executionTimeBudget > 0
        ? projectedTime / account.executionTimeBudget
        : 0;

    // Overall utilization is the max across dimensions
    const maxUtil = Math.max(tokenUtil, costUtil, timeUtil);

    const warnings: string[] = [];
    let action: BudgetAction = "allow";

    if (tokenUtil >= BudgetEnforcer.WARN_THRESHOLD) {
      warnings.push(
        `Token budget at ${(tokenUtil * 100).toFixed(1)}% utilization`
      );
    }
    if (costUtil >= BudgetEnforcer.WARN_THRESHOLD) {
      warnings.push(
        `Cost budget at ${(costUtil * 100).toFixed(1)}% utilization`
      );
    }
    if (timeUtil >= BudgetEnforcer.WARN_THRESHOLD) {
      warnings.push(
        `Execution time budget at ${(timeUtil * 100).toFixed(1)}% utilization`
      );
    }

    if (maxUtil >= BudgetEnforcer.DENY_THRESHOLD) {
      action = "deny";
    } else if (maxUtil >= BudgetEnforcer.THROTTLE_THRESHOLD) {
      action = "throttle";
    } else if (maxUtil >= BudgetEnforcer.WARN_THRESHOLD) {
      action = "warn";
    }

    // If within 5% of deny, suggest getting approval before proceeding
    if (action === "throttle" && maxUtil >= 0.95) {
      action = "request_approval";
    }

    const remaining = {
      tokens: Math.max(0, account.tokenBudget - projectedTokens),
      costUsd: Math.max(0, account.costBudgetUsd - projectedCost),
      executionTimeMs: Math.max(
        0,
        account.executionTimeBudget - projectedTime
      ),
    };

    return {
      allowed: action !== "deny",
      action,
      remaining,
      utilizationPercent: {
        tokens: Math.min(100, tokenUtil * 100),
        costUsd: Math.min(100, costUtil * 100),
        executionTimeMs: Math.min(100, timeUtil * 100),
      },
      warnings,
    };
  }

  /**
   * Record actual usage after an action has completed.
   */
  recordUsage(accountId: string, usage: Partial<ResourceUsage>): void {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error(`Budget account not found: ${accountId}`);

    this.maybeReset(account);

    account.tokenUsed += usage.tokens ?? 0;
    account.costUsed += usage.costUsd ?? 0;
    account.executionTimeUsed += usage.executionTimeMs ?? 0;
    account.updatedAt = new Date().toISOString();

    this.accounts.set(accountId, account);
  }

  /**
   * Reset all accounts whose reset period has elapsed.
   */
  resetPeriodBudgets(): void {
    const now = new Date();
    for (const account of this.accounts.values()) {
      if (!account.resetAt) continue;
      if (new Date(account.resetAt) <= now) {
        this.performReset(account);
      }
    }
  }

  private maybeReset(account: BudgetAccount): void {
    if (!account.resetAt) return;
    if (new Date(account.resetAt) <= new Date()) {
      this.performReset(account);
    }
  }

  private performReset(account: BudgetAccount): void {
    account.tokenUsed = 0;
    account.costUsed = 0;
    account.executionTimeUsed = 0;
    account.resetAt = this.computeResetAt(account.period);
    account.updatedAt = new Date().toISOString();
    this.accounts.set(account.accountId, account);
  }
}
