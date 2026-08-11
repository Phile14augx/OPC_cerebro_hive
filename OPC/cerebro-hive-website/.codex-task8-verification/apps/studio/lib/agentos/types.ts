// Cerebro AgentOS — core runtime types.
// This runtime is real, executing TypeScript (no external LLM call): every
// number, trace, and memory record below is computed at request time, not
// mocked or randomized.

export type ReasoningStrategy =
  | "Tool-Augmented Reasoning"
  | "Planner-Executor"
  | "Tree of Thoughts"
  | "ReAct"
  | "Chain of Thought";

export interface GuardFinding {
  type: "pii" | "prompt-injection";
  label: string;
  match: string;
}

export interface GuardReport {
  input: string;
  redactedInput: string;
  findings: GuardFinding[];
  riskScore: number; // 0-100
  blocked: boolean;
}

export interface ReasoningDecision {
  strategy: ReasoningStrategy;
  rationale: string;
  confidence: number; // 0-1
  signals: string[];
}

export interface PlanStep {
  id: number;
  description: string;
  tool?: string;
}

export interface ToolCallResult {
  tool: string;
  input: string;
  output: string;
  durationMs: number;
}

export interface StepTrace {
  step: PlanStep;
  startedAt: number;
  durationMs: number;
  toolCall?: ToolCallResult;
  memoryWrites: string[];
  output: string;
}

export interface MemoryRecord {
  id: string;
  tier: "shortTerm" | "episodic" | "semantic" | "organizational";
  sessionId: string;
  content: string;
  createdAt: number;
}

export interface MemorySnapshot {
  shortTerm: MemoryRecord[];
  episodic: MemoryRecord[];
  semantic: MemoryRecord[];
  organizational: MemoryRecord[];
  totalRecords: number;
}

export interface EvalReport {
  latencyMs: number;
  stepCount: number;
  toolCallCount: number;
  grounded: boolean;
  groundednessReason: string;
  riskScore: number;
  costEstimateUsd: number;
}

export interface AgentRunResult {
  sessionId: string;
  input: string;
  guard: GuardReport;
  reasoning: ReasoningDecision;
  plan: PlanStep[];
  trace: StepTrace[];
  answer: string;
  memory: MemorySnapshot;
  evaluation: EvalReport;
}
