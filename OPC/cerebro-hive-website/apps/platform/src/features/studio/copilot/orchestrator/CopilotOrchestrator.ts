
import { CopilotSession } from '../session/CopilotSession';
import { ToolInvocationLayer } from '../tools/ToolInvocationLayer';
import { IntentParser } from '../authoring/IntentParser';
import { RuntimeAdvisor } from '../advisor/RuntimeAdvisor';
import { WorkflowOptimizer } from '../optimizer/WorkflowOptimizer';
import { ReadinessReportGenerator } from '../readiness/ReadinessReportGenerator';

export type CopilotIntent =
  | { type: 'Author'; prompt: string }
  | { type: 'Advise'; question: string; executionId?: string }
  | { type: 'Optimize'; workflowId: string; objective: string }
  | { type: 'ReadinessCheck'; workflowId: string };

export interface CopilotResponse {
  sessionId: string;
  answer: string;
  evidence: EvidenceItem[];
  confidence: 'High' | 'Medium' | 'Low';
  artifacts?: Record<string, unknown>;
}

export interface EvidenceItem {
  source: string;       // e.g. "PlannerTrace#44", "SimulationRun#sim-4df2"
  excerpt: string;
  artifactRef?: string;
}

/**
 * CopilotOrchestrator — the only new top-level component in M26.
 *
 * Follows an explicit Reason → Plan → Validate → (Approve) → Execute
 * lifecycle. All write paths (workflow authoring, "Apply" on optimizations)
 * route through the existing Compiler → Versioning → Release pipeline.
 * The Copilot never directly mutates platform state.
 */
export class CopilotOrchestrator {
  constructor(
    private readonly tools: ToolInvocationLayer,
    private readonly sessions: Map<string, CopilotSession> = new Map(),
  ) {}

  async handle(sessionId: string, intent: CopilotIntent): Promise<CopilotResponse> {
    const session = this.getOrCreateSession(sessionId);

    switch (intent.type) {
      case 'Author':
        return IntentParser.parse(intent.prompt, session, this.tools);
      case 'Advise':
        return RuntimeAdvisor.advise(intent.question, intent.executionId, session, this.tools);
      case 'Optimize':
        return WorkflowOptimizer.optimize(intent.workflowId, intent.objective, session, this.tools);
      case 'ReadinessCheck':
        return ReadinessReportGenerator.check(intent.workflowId, session, this.tools);
    }
  }

  private getOrCreateSession(sessionId: string): CopilotSession {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new CopilotSession(sessionId));
    }
    return this.sessions.get(sessionId)!;
  }
}
