import { ExecutionPlan } from '../planning/ExecutionPlan';
import { GovernanceContextSnapshot } from './GovernanceContextSnapshot';
import { GovernanceRule, RuleResult, RuleAST, RuleStage, RuleExpansion, EventTimelineRecord, DecisionReason } from './GovernanceRule';
import { Goal } from '../planning/Goal';
import { GovernanceGraphValidator } from './GovernanceGraphValidator';

export class GovernanceRuleEngine {
  public async evaluateStage(
    stage: RuleStage,
    rules: GovernanceRule[],
    plan: ExecutionPlan,
    goal: Goal,
    snapshot: GovernanceContextSnapshot,
    options?: { executionTraceId?: string }
  ): Promise<{ results: RuleResult[], timeline: EventTimelineRecord[] }> {
    const executionTraceId = options?.executionTraceId || 'trace-' + Math.random().toString(36).substr(2, 9);
    const timeline: EventTimelineRecord[] = [];

    let currentRules = [...rules];
    const resultsMap = new Map<string, RuleResult>();
    const results: RuleResult[] = [];
    
    let hasUnexecutedRules = true;
    let globalExecutionOrder = 1;
    let currentTierIndex = 1;

    while (hasUnexecutedRules) {
      const stageRules = currentRules.filter(r => r.stage === stage);
      const tiers = this.buildExecutionTiers(stageRules);
      
      hasUnexecutedRules = false;
      let graphExpanded = false;

      for (const tier of tiers) {
        // Only execute rules that haven't been evaluated yet
        const unexecutedTier = tier.filter(rule => !resultsMap.has(rule.id));
        if (unexecutedTier.length === 0) continue;

        hasUnexecutedRules = true;
        const currentExecutionTier = currentTierIndex++;

        const tierPromises = unexecutedTier.map(async (rule) => {
          const startedAt = new Date();
          timeline.push({ timestamp: startedAt, type: 'RuleStarted', ruleId: rule.id, traceId: executionTraceId });
          
          // 1. Dependency Check (Conditional short-circuiting)
          const dependencyFailures: string[] = [];
          let branchNotSelectedReason: string | undefined = undefined;
          const resolvedDependencies: string[] = [];

          if (rule.dependsOn) {
            for (const dep of rule.dependsOn) {
              const depId = typeof dep === 'string' ? dep : dep.ruleId;
              resolvedDependencies.push(depId);
              const when = typeof dep === 'string' ? 'Passed' : (dep.when || 'Passed');
              
              const depResult = resultsMap.get(depId);
              
              if (depResult) {
                if (when === 'Passed') {
                  if (depResult.status !== 'Passed') {
                    dependencyFailures.push(depId);
                  }
                } else if (when === 'Failed') {
                  if (depResult.status === 'Passed') {
                    branchNotSelectedReason = `Parent rule '${depId}' passed; escalation path not selected.`;
                  } else if (depResult.status === 'SkippedDependency' || depResult.status === 'SkippedOptimization') {
                    dependencyFailures.push(depId);
                  }
                }
              } else {
                dependencyFailures.push(depId);
              }
            }
          }

          if (dependencyFailures.length > 0) {
            const completedAt = new Date();
            const res: RuleResult = {
              ruleId: rule.id,
              status: 'SkippedDependency',
              executed: false,
              dependencyFailures,
              severity: rule.severity,
              reason: `Skipped due to upstream dependency failure: ${dependencyFailures.join(', ')}`,
              executionTimeMs: 0,
              metadata: {
                traceId: executionTraceId,
                metadataVersion: 1,
                tier: currentExecutionTier,
                executionOrder: globalExecutionOrder++,
                startedAt,
                completedAt,
                durationMs: 0,
                workerId: 'local-worker',
                schedulerId: 'hive-scheduler-v1',
                executionAttempt: 1,
                retryCount: 0,
                queueWaitMs: 0,
                executionState: ['SkippedDependency'],
                resolvedDependencies,
                resources: { cpuTimeMs: 0, memoryBytes: 1024 }
              }
            };
            resultsMap.set(rule.id, res);
            results.push(res);
            return;
          }

          if (branchNotSelectedReason) {
            const completedAt = new Date();
            const res: RuleResult = {
              ruleId: rule.id,
              status: 'SkippedOptimization',
              executed: false,
              dependencyFailures: [],
              branchReason: branchNotSelectedReason,
              severity: rule.severity,
              reason: branchNotSelectedReason,
              executionTimeMs: 0,
              metadata: {
                traceId: executionTraceId,
                metadataVersion: 1,
                tier: currentExecutionTier,
                executionOrder: globalExecutionOrder++,
                startedAt,
                completedAt,
                durationMs: 0,
                workerId: 'local-worker',
                schedulerId: 'hive-scheduler-v1',
                executionAttempt: 1,
                retryCount: 0,
                queueWaitMs: 0,
                executionState: ['SkippedOptimization'],
                resolvedDependencies,
                resources: { cpuTimeMs: 0, memoryBytes: 1024 }
              }
            };
            resultsMap.set(rule.id, res);
            results.push(res);
            return;
          }

          // 2. Execution
          const executionStartTime = performance.now();
          try {
            let passed = true;
            let reason = undefined;
            let expansion: RuleExpansion | undefined = undefined;

            if (rule.evaluateNative) {
              const nativeResult = await rule.evaluateNative(plan, snapshot);
              if (typeof nativeResult === 'boolean') {
                  passed = nativeResult;
              } else {
                  passed = nativeResult.passed;
                  expansion = nativeResult.expansion;
              }
              if (!passed) reason = 'Native evaluation failed';
            } else if (rule.ast) {
              const evalResult = this.evaluateAST(rule.ast, plan, goal, snapshot);
              passed = evalResult.passed;
              if (!passed) reason = evalResult.reason;
            }

            const executionTimeMs = performance.now() - executionStartTime;
            const completedAt = new Date();
            
            if (executionTimeMs > 50) {
              const res: RuleResult = {
                ruleId: rule.id,
                status: 'Error',
                executed: true,
                dependencyFailures: [],
                severity: 'Block',
                reason: 'Rule execution timed out',
                executionTimeMs,
                metadata: {
                traceId: executionTraceId,
                metadataVersion: 1,
                  tier: currentExecutionTier,
                  executionOrder: globalExecutionOrder++,
                  startedAt,
                  completedAt,
                  durationMs: completedAt.getTime() - startedAt.getTime(),
                  workerId: 'local-worker',
                  schedulerId: 'hive-scheduler-v1',
                  executionAttempt: 1,
                  retryCount: 0,
                  queueWaitMs: 0,
                  executionState: ['Executed', 'Error'],
                  resolvedDependencies,
                resources: { cpuTimeMs: executionTimeMs, memoryBytes: 1024 }
                }
              };
              resultsMap.set(rule.id, res);
              results.push(res);
              return;
            }

            const res: RuleResult = {
              ruleId: rule.id,
              status: passed ? 'Passed' : 'Failed',
              executed: true,
              dependencyFailures: [],
              severity: rule.severity,
              reason: passed ? undefined : (reason || 'AST condition not met'),
              executionTimeMs,
              expansion,
              metadata: {
                traceId: executionTraceId,
                metadataVersion: 1,
                tier: currentExecutionTier,
                executionOrder: globalExecutionOrder++,
                startedAt,
                completedAt,
                durationMs: completedAt.getTime() - startedAt.getTime(),
                workerId: 'local-worker',
                schedulerId: 'hive-scheduler-v1',
                executionAttempt: 1,
                retryCount: 0,
                queueWaitMs: 0,
                executionState: ['Executed', passed ? 'Passed' : 'Failed', ...(rule.provenance ? ['Injected'] : []), ...(expansion ? ['Expanded'] : [])],
                resolvedDependencies,
                resources: { cpuTimeMs: executionTimeMs, memoryBytes: 1024 }
              }
            };
            resultsMap.set(rule.id, res);
            results.push(res);

          } catch (err: any) {
            const completedAt = new Date();
            const res: RuleResult = {
              ruleId: rule.id,
              status: 'Error',
              executed: true,
              dependencyFailures: [],
              severity: 'Block',
              reason: `Rule execution crashed: ${err.message}`,
              executionTimeMs: performance.now() - executionStartTime,
              metadata: {
                traceId: executionTraceId,
                metadataVersion: 1,
                tier: currentExecutionTier,
                executionOrder: globalExecutionOrder++,
                startedAt,
                completedAt,
                durationMs: completedAt.getTime() - startedAt.getTime(),
                workerId: 'local-worker',
                schedulerId: 'hive-scheduler-v1',
                executionAttempt: 1,
                retryCount: 0,
                queueWaitMs: 0,
                executionState: ['Executed', 'Error'],
                resolvedDependencies,
                resources: { cpuTimeMs: performance.now() - executionStartTime, memoryBytes: 1024 }
              }
            };
            resultsMap.set(rule.id, res);
            results.push(res);
          }
        });

        // Execute all rules in the current tier concurrently
        await Promise.all(tierPromises);

        // 3. Process Expansions
        const newRulesToInject: GovernanceRule[] = [];
        
        for (const rule of unexecutedTier) {
          const res = resultsMap.get(rule.id);
          if (res && res.expansion && res.expansion.rules.length > 0) {
            for (const newRule of res.expansion.rules) {
              // Rule Provenance Injection
              newRule.provenance = {
                sourceRuleId: rule.id,
                expansionReason: res.expansion.reason,
                expansionTimestamp: new Date(),
                expansionDepth: (rule.provenance?.expansionDepth || 0) + 1
              };
              
              // Automatic Dependency Injection
              newRule.dependsOn = newRule.dependsOn || [];
              newRule.dependsOn.push({ 
                ruleId: rule.id, 
                when: res.status === 'Passed' ? 'Passed' : 'Failed' 
              });
              newRulesToInject.push(newRule);
            }
          }
        }

        if (newRulesToInject.length > 0) {
          currentRules = [...currentRules, ...newRulesToInject];
          
          // Re-validate entire graph
          GovernanceGraphValidator.validate(currentRules);
          
          graphExpanded = true;
          break; // Break tier loop to rebuild DAG
        }
      }

      if (!graphExpanded) {
        // If we finished all tiers without any expansion, we are done
        break;
      }
    }

    return { results, timeline };
  }

  /**
   * Performs topological sort and groups rules into independent execution tiers.
   */
  private buildExecutionTiers(rules: GovernanceRule[]): GovernanceRule[][] {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();
    const ruleMap = new Map<string, GovernanceRule>();

    for (const rule of rules) {
      ruleMap.set(rule.id, rule);
      inDegree.set(rule.id, 0);
      graph.set(rule.id, []);
    }

    for (const rule of rules) {
      if (rule.dependsOn) {
        for (const dep of rule.dependsOn) {
          const depId = typeof dep === 'string' ? dep : dep.ruleId;
          if (graph.has(depId)) {
            graph.get(depId)!.push(rule.id);
            inDegree.set(rule.id, inDegree.get(rule.id)! + 1);
          }
        }
      }
    }

    const tiers: GovernanceRule[][] = [];
    let queue: string[] = [];

    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    while (queue.length > 0) {
      const currentTier = queue.map(id => ruleMap.get(id)!);
      tiers.push(currentTier);

      const nextQueue: string[] = [];
      for (const id of queue) {
        for (const neighbor of graph.get(id)!) {
          inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
          if (inDegree.get(neighbor) === 0) {
            nextQueue.push(neighbor);
          }
        }
      }
      queue = nextQueue;
    }

    return tiers;
  }

  private evaluateAST(ast: RuleAST, plan: ExecutionPlan, goal: Goal, snapshot: GovernanceContextSnapshot): { passed: boolean, reason?: string } {
    if (ast.operator === 'EQUALS' && ast.field && ast.value !== undefined) {
      const actualValue = this.resolveFieldValue(ast.field, plan, goal, snapshot);
      return { passed: actualValue === ast.value, reason: `Expected ${ast.value} but got ${actualValue}` };
    }
    
    if (ast.operator === 'GREATER_THAN' && ast.field && ast.value !== undefined) {
      const actualValue = this.resolveFieldValue(ast.field, plan, goal, snapshot);
      return { passed: actualValue > ast.value, reason: `Expected > ${ast.value} but got ${actualValue}` };
    }

    if (ast.operator === 'LESS_THAN' && ast.field && ast.value !== undefined) {
      const actualValue = this.resolveFieldValue(ast.field, plan, goal, snapshot);
      return { passed: actualValue < ast.value, reason: `Expected < ${ast.value} but got ${actualValue}` };
    }

    if (ast.operator === 'AND' && ast.children) {
      for (const child of ast.children) {
        const res = this.evaluateAST(child, plan, goal, snapshot);
        if (!res.passed) return res;
      }
      return { passed: true };
    }

    if (ast.operator === 'OR' && ast.children) {
      const failures: string[] = [];
      for (const child of ast.children) {
        const res = this.evaluateAST(child, plan, goal, snapshot);
        if (res.passed) return { passed: true };
        if (res.reason) failures.push(res.reason);
      }
      return { passed: false, reason: `None of OR conditions met: ${failures.join(' | ')}` };
    }

    if (ast.operator === 'NOT' && ast.children && ast.children.length === 1) {
      const res = this.evaluateAST(ast.children[0], plan, goal, snapshot);
      return { passed: !res.passed, reason: `NOT condition failed` };
    }

    return { passed: false, reason: 'Unsupported AST operator' };
  }

  private resolveFieldValue(field: string, plan: ExecutionPlan, goal: Goal, snapshot: GovernanceContextSnapshot): any {
    if (field === 'goal.intent') return goal.intent;
    if (field === 'snapshot.isWeekend') return snapshot.isWeekend;
    if (field === 'snapshot.hourOfDay') return snapshot.hourOfDay;
    if (field === 'plan.totalCost') {
      return plan.nodes.reduce((acc, node) => acc + (node.estimatedCostUsd || 0), 0);
    }
    return undefined;
  }
}
