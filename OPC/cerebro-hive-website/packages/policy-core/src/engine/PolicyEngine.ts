import { PolicyRule, PolicyObligation, PolicyAdvice } from '../models/PolicyRule';
import { ResourceDescriptor } from '../models/ResourceDescriptor';
import { ConditionEngine } from './ConditionEngine';
import { OptimizedPolicyBundle } from '../distribution/Compiler';

export type PolicyDecisionType = 'Permit' | 'Deny' | 'NotApplicable' | 'Indeterminate';
export type EngineExecutionMode = 'Enforce' | 'Shadow';

export interface PolicyDecision {
  decisionId: string;
  traceId: string;
  decision: PolicyDecisionType;
  enforcementMode: EngineExecutionMode;
  matchedPolicies: string[];
  skippedPolicies: string[];
  obligations: PolicyObligation[];
  advice: PolicyAdvice[];
  evaluationTimeMs: number;
  evaluationPath: string[];
  identity: string;
  resource?: string;
  action: string;
  reason: string;
  timestamp: Date;
  engineVersion: string;
  bundleVersion?: string;
}

export class PolicyEngine {
  private conditionEngine: ConditionEngine;

  constructor() {
    this.conditionEngine = new ConditionEngine();
  }

  evaluate(
    bundle: OptimizedPolicyBundle | PolicyRule[],
    identityContext: IdentityContext,
    action: string,
    resourceContext?: ResourceDescriptor,
    mode: EngineExecutionMode = 'Enforce'
  ): PolicyDecision {
    const start = performance.now();
    const evaluationContext = {
      identity: identityContext,
      resource: resourceContext,
      action
    };

    let finalDecision: PolicyDecisionType = 'NotApplicable';
    let matchedPolicies: string[] = [];
    let skippedPolicies: string[] = [];
    let obligations: PolicyObligation[] = [];
    let advice: PolicyAdvice[] = [];
    let highestPriority = -1;
    let reason = 'No policies matched the context.';
    let bundleVersionStr = undefined;

    let policiesToEvaluate: any[] = [];
    
    // Support both raw arrays (for Simulator) and Optimized Bundles (for Runtime)
    if (Array.isArray(bundle)) {
      policiesToEvaluate = [...bundle].sort((a, b) => b.priority - a.priority);
    } else {
      bundleVersionStr = bundle.version;
      // Use Indexes for O(1) resolution
      const actionMatches = bundle.actionIndex[action] || [];
      const wildcardActionMatches = bundle.actionIndex['*'] || [];
      const relevantPolicyIds = new Set([...actionMatches, ...wildcardActionMatches]);
      
      if (resourceContext) {
        const resourceMatches = bundle.resourceIndex[resourceContext.type] || [];
        const wildcardResourceMatches = bundle.resourceIndex['*'] || [];
        // Intersect
        const resourceSet = new Set([...resourceMatches, ...wildcardResourceMatches]);
        for (const id of relevantPolicyIds) {
          if (!resourceSet.has(id)) relevantPolicyIds.delete(id);
        }
      }

      for (const id of relevantPolicyIds) {
        policiesToEvaluate.push(bundle.compiledRules[id]);
      }
      
      // Re-sort by priority since Sets lose order
      policiesToEvaluate.sort((a, b) => b.priority - a.priority);
    }

    for (const policy of policiesToEvaluate) {
      try {
        // Note: For raw policies, we need to check Action/Resource matching here.
        // For bundles, this was already handled by the index.
        if (Array.isArray(bundle)) {
          const actionMatch = policy.actions.includes('*') || policy.actions.includes(action);
          if (!actionMatch) {
            skippedPolicies.push(policy.id);
            continue;
          }

          const resourceMatch = !resourceContext || policy.resources.includes('*') || policy.resources.includes(resourceContext.type);
          if (!resourceMatch) {
            skippedPolicies.push(policy.id);
            continue;
          }
        }

        // Check Conditions
        let conditionsMatch = true;
        for (const condition of policy.conditions) {
          if (!this.conditionEngine.evaluateCondition(condition, evaluationContext)) {
            conditionsMatch = false;
            break;
          }
        }

        if (!conditionsMatch) {
          skippedPolicies.push(policy.id);
          continue;
        }

        // Policy Matched
        matchedPolicies.push(policy.id);
        
        if (policy.obligations) obligations.push(...policy.obligations);
        if (policy.advice) advice.push(...policy.advice);
        
        // Deny Overrides logic
        if (policy.effect === 'Deny') {
          finalDecision = 'Deny';
          reason = `Explicitly denied by policy: ${policy.name}`;
          break; // Stop evaluating on Explicit Deny
        }

        // Permit (only if we haven't already permitted at a higher priority)
        if (finalDecision !== 'Permit') {
          finalDecision = 'Permit';
          highestPriority = policy.priority;
          reason = `Permitted by policy: ${policy.name}`;
        }
        
      } catch (err) {
        return {
          decisionId: `dec-${Date.now()}`,
          traceId: identityContext.correlationId,
          enforcementMode: mode,
          decision: 'Indeterminate',
          matchedPolicies,
          skippedPolicies,
          obligations: [],
          advice: [],
          evaluationTimeMs: performance.now() - start,
          evaluationPath: ['Error during evaluation'],
          identity: identityContext.currentPrincipal.id,
          resource: resourceContext?.id,
          action,
          reason: `Evaluation failed: ${(err as Error).message}`,
          timestamp: new Date(),
          engineVersion: '1.0.0'
        };
      }
    }

    // Default Deny if NotApplicable
    if (finalDecision === 'NotApplicable') {
      finalDecision = 'Deny';
      reason = 'Implicit Deny: No policies explicitly permitted this action.';
    }

    // Shadow Mode (Audit Only)
    if (mode === 'Shadow' && finalDecision === 'Deny') {
      // In shadow mode, we record the Deny intent but return Permit to not break production traffic
      finalDecision = 'Permit';
      reason = `[SHADOW MODE] Would have been Deny: ${reason}`;
    }

    return {
      decisionId: `dec-${Date.now()}`,
      traceId: identityContext.correlationId,
      enforcementMode: mode,
      decision: finalDecision,
      matchedPolicies,
      skippedPolicies,
      obligations,
      advice,
      evaluationTimeMs: performance.now() - start,
      evaluationPath: ['Evaluated JSON Policy Rules'],
      identity: identityContext.currentPrincipal.id,
      resource: resourceContext?.id,
      action,
      reason,
      timestamp: new Date(),
      engineVersion: '1.0.0',
      bundleVersion: bundleVersionStr
    };
  }
}
