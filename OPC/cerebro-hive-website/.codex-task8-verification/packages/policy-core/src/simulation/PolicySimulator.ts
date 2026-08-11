import { PolicyEngine, PolicyDecision } from '../engine/PolicyEngine';
import { PolicyRule } from '../models/PolicyRule';
import { IdentityContext } from '@cerebro/identity-core';
import { ResourceDescriptor } from '../models/ResourceDescriptor';

export interface HistoricalRequest {
  id: string;
  identityContext: IdentityContext;
  action: string;
  resourceContext?: ResourceDescriptor;
  originalDecision: 'Permit' | 'Deny' | 'NotApplicable' | 'Indeterminate';
}

export interface SimulationResult {
  requestId: string;
  historicalDecision: string;
  simulatedDecision: string;
  isDiff: boolean;
  reasoning: string;
}

export interface SimulationReport {
  totalEvaluated: number;
  diffCount: number;
  newDenies: number;
  newPermits: number;
  results: SimulationResult[];
}

export class PolicySimulator {
  private engine: PolicyEngine;

  constructor() {
    this.engine = new PolicyEngine();
  }

  /**
   * Synchronous simulation for small datasets (UI interactive mode)
   */
  simulateSync(candidatePolicies: PolicyRule[], requests: HistoricalRequest[]): SimulationReport {
    let newDenies = 0;
    let newPermits = 0;
    let diffCount = 0;
    const results: SimulationResult[] = [];

    for (const req of requests) {
      const decision = this.engine.evaluate(candidatePolicies, req.identityContext, req.action, req.resourceContext);
      
      const isDiff = decision.decision !== req.originalDecision;
      if (isDiff) {
        diffCount++;
        if (decision.decision === 'Deny') newDenies++;
        if (decision.decision === 'Permit') newPermits++;
      }

      results.push({
        requestId: req.id,
        historicalDecision: req.originalDecision,
        simulatedDecision: decision.decision,
        isDiff,
        reasoning: decision.reason
      });
    }

    return {
      totalEvaluated: requests.length,
      diffCount,
      newDenies,
      newPermits,
      results
    };
  }

  /**
   * Asynchronous simulation for massive datasets (submitted as a background job)
   */
  async simulateAsync(candidatePolicies: PolicyRule[], requests: HistoricalRequest[]): Promise<string> {
    // In reality, this pushes a job to Temporal/Queue, and returns a JobID
    const jobId = `sim-job-${Date.now()}`;
    // Mock async background processing
    setTimeout(() => {
      const report = this.simulateSync(candidatePolicies, requests);
      console.log(`[Simulator Background Job ${jobId} Completed]: ${report.diffCount} diffs found.`);
    }, 100);
    return jobId;
  }
}
