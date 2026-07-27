/**
 * M24 — ExecutionResources
 *
 * Budget tracking owned by ExecutionContext.
 * Integrates naturally with HiveOps / enterprise governance later.
 */

export interface ResourceBudget {
  maxTokens: number;
  maxCostUsd: number;
  maxWallClockMs: number;
  maxNetworkCalls: number;
  maxMemoryMb: number;
}

export interface ResourceUsage {
  tokensConsumed: number;
  costUsd: number;
  wallClockMs: number;
  networkCalls: number;
  memoryPeakMb: number;
}

export class ExecutionResources {
  private budget: ResourceBudget;
  private usage: ResourceUsage = {
    tokensConsumed: 0,
    costUsd: 0,
    wallClockMs: 0,
    networkCalls: 0,
    memoryPeakMb: 0,
  };

  constructor(budget: Partial<ResourceBudget> = {}) {
    this.budget = {
      maxTokens: budget.maxTokens ?? Infinity,
      maxCostUsd: budget.maxCostUsd ?? Infinity,
      maxWallClockMs: budget.maxWallClockMs ?? Infinity,
      maxNetworkCalls: budget.maxNetworkCalls ?? Infinity,
      maxMemoryMb: budget.maxMemoryMb ?? Infinity,
    };
  }

  consume(delta: Partial<ResourceUsage>): void {
    if (delta.tokensConsumed) this.usage.tokensConsumed += delta.tokensConsumed;
    if (delta.costUsd) this.usage.costUsd += delta.costUsd;
    if (delta.wallClockMs) this.usage.wallClockMs += delta.wallClockMs;
    if (delta.networkCalls) this.usage.networkCalls += delta.networkCalls;
  }

  isExhausted(): { exhausted: boolean; reason?: string } {
    if (this.usage.tokensConsumed >= this.budget.maxTokens)
      return { exhausted: true, reason: `Token budget exhausted (${this.usage.tokensConsumed}/${this.budget.maxTokens})` };
    if (this.usage.costUsd >= this.budget.maxCostUsd)
      return { exhausted: true, reason: `Cost budget exhausted ($${this.usage.costUsd.toFixed(4)}/$${this.budget.maxCostUsd})` };
    if (this.usage.networkCalls >= this.budget.maxNetworkCalls)
      return { exhausted: true, reason: `Network call budget exhausted` };
    return { exhausted: false };
  }

  snapshot(): { budget: ResourceBudget; usage: ResourceUsage } {
    return { budget: { ...this.budget }, usage: { ...this.usage } };
  }
}
