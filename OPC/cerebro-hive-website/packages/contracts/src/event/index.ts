/**
 * Canonical schemas for Events in the CerebroHive Agent Engineering Platform.
 */

export interface EventDefinition {
  id: string;
  type: 'AgentStarted' | 'NodeStarted' | 'ToolCalled' | 'ModelInvoked' | 'MemoryRead' | 'MemoryWrite' | 'NodeCompleted' | 'AgentCompleted' | string;
  timestamp: string;
  source: string; // The origin of the event (e.g., node ID, tool ID)
  payload: Record<string, unknown>; // Event-specific data
  metadata?: {
    traceId?: string;
    spanId?: string;
    tenantId?: string;
  };
}
