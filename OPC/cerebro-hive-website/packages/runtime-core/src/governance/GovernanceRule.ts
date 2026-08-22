import { ExecutionPlan } from '../planning/ExecutionPlan';
import { GovernanceContextSnapshot } from './GovernanceContextSnapshot';

export type RuleCategory = 'Security' | 'Compliance' | 'Financial' | 'Operational' | 'Organizational';
export type RuleStage = 'PreScoring' | 'PostScoring';
export type RuleSeverity = 'Block' | 'Warn' | 'Audit';

export type RuleResultStatus = 'Passed' | 'Failed' | 'SkippedDependency' | 'SkippedPolicy' | 'SkippedOptimization' | 'Error';

export interface ResourceMetrics {
  cpuTimeMs?: number;
  memoryBytes?: number;
  networkCalls?: number;
  dbQueries?: number;
  llmTokens?: number;
  costEstimate?: number;
}

export interface DecisionReason {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  override?: boolean;
}

export interface EventTimelineRecord {
  timestamp: Date;
  type: 'RuleStarted' | 'RulePassed' | 'RuleFailed' | 'RuleSkipped' | 'RuleExpanded' | 'RuleInjected';
  ruleId: string;
  traceId: string;
  details?: Record<string, unknown>;
}

export interface ExecutionMetadata {
  traceId: string;
  metadataVersion: number;
  tier: number;
  executionOrder: number;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  workerId?: string;
  parallelGroup?: number;
  schedulerId?: string;
  executionAttempt?: number;
  retryCount?: number;
  queueWaitMs?: number;
  executionState?: string[]; // e.g., ['Injected', 'Expanded', 'Passed']
  resolvedDependencies?: string[]; // Used for rebuilding DAG in analytics
  resources?: ResourceMetrics;
}

export interface RuleResult {
  ruleId: string;
  status: RuleResultStatus;
  executed: boolean;
  severity: RuleSeverity;
  reason?: string;
  decisionReason?: DecisionReason;
  approvalRequired?: boolean;
  policyId?: string;
  dependencyFailures: string[];
  branchReason?: string;
  executionTimeMs: number;
  evidence?: unknown;
  recommendation?: string;
  expansion?: RuleExpansion;
  metadata?: ExecutionMetadata;
}

export interface RuleProvenance {
  sourceRuleId: string;
  expansionReason?: string;
  expansionTimestamp: Date;
  expansionDepth: number;
}

export interface RuleExpansion {
  rules: GovernanceRule[];
  reason?: string;
}

export interface RuleDependency {
  ruleId: string;
  when?: 'Passed' | 'Failed';
}

// AST structure for declarative rules
export interface RuleAST {
  operator: 'AND' | 'OR' | 'NOT' | 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN';
  field?: string; // e.g. "goal.intent", "snapshot.isWeekend", "plan.totalCost"
  value?: unknown;
  children?: RuleAST[];
}

export interface GovernanceRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  stage: RuleStage; // PreScoring (fast, deterministic) vs PostScoring (expensive, contextual)
  severity: RuleSeverity;
  dependsOn?: Array<string | RuleDependency>; // Rule IDs this rule depends on
  provenance?: RuleProvenance; // Embedded provenance for dynamically injected rules
  
  // Primary: Declarative AST
  ast?: RuleAST;
  
  // Secondary: Native Execution (for exceptional logic)
  evaluateNative?: (plan: ExecutionPlan, snapshot: GovernanceContextSnapshot) => Promise<boolean | { passed: boolean, expansion?: RuleExpansion }>;
}
