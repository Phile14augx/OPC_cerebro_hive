import { CompiledAssessmentPackage } from "../compiler";
import { GlobalEventBus } from "./events";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  memoryUsageMb: number;
}

/**
 * Universal interface for executing isolated untrusted code.
 * Replaces hardcoded Docker integration with a pluggable provider pattern.
 */
export interface IExecutionProvider {
  name: string;
  executeCode(code: string, language: string, envContext: any): Promise<ExecutionResult>;
}

// Phase 3: Mock Provider to avoid local Docker dependency during architecture iteration
export class MockExecutionProvider implements IExecutionProvider {
  name = "MockSandbox";

  async executeCode(code: string, language: string, envContext: any): Promise<ExecutionResult> {
    console.log(`[${this.name}] Executing ${language} code...`);
    // Simulate compilation and execution delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      stdout: "> Compiling...\n> Running tests...\n> Passed: 3/3\n",
      stderr: "",
      exitCode: 0,
      durationMs: 1450,
      memoryUsageMb: 24.5
    };
  }
}

/**
 * Represents the persistent state of a candidate's session.
 * Used for autosave, crash recovery, and replay analytics.
 */
export interface CandidateSession {
  sessionId: string;
  candidateId: string;
  assessmentId: string;
  version: number;
  startedAt: string;
  status: "in_progress" | "submitted" | "evaluating" | "completed";
  widgetStates: Record<string, any>; // widgetId -> current state (e.g. current source code)
  timelineEvents: string[]; // references to EventBus telemetry events
}

/**
 * The Runtime Context passed to Widgets during rendering and execution.
 */
export class RuntimeContext {
  constructor(
    public session: CandidateSession,
    public assessmentPackage: CompiledAssessmentPackage,
    public executionProvider: IExecutionProvider
  ) {}

  async runWidgetExecution(widgetId: string, code: string, language: string): Promise<ExecutionResult> {
    GlobalEventBus.publish("WIDGET_EXECUTED", this.session.candidateId, this.assessmentPackage.manifest.assessmentId, { widgetId, language }, widgetId);
    
    try {
      const result = await this.executionProvider.executeCode(code, language, {});
      GlobalEventBus.publish("TESTS_RUN", this.session.candidateId, this.assessmentPackage.manifest.assessmentId, result, widgetId);
      return result;
    } catch (error) {
      GlobalEventBus.publish("COMPILATION_ERROR", this.session.candidateId, this.assessmentPackage.manifest.assessmentId, { error }, widgetId);
      throw error;
    }
  }

  saveState(widgetId: string, state: any) {
    this.session.widgetStates[widgetId] = state;
    // In production, this debounces and calls an API to persist state
  }
}
