import { Runbook } from '../domain/Runbook';

export interface ExecutionResult {
  success: boolean;
  logs: string[];
  durationMs: number;
}

export interface RunbookProviderPort {
  supports(providerName: string): boolean;
  execute(runbook: Runbook, targetNodeId: string): Promise<ExecutionResult>;
}
