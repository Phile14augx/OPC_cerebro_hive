export interface ExecutionSnapshot {
  readonly id: string;
  readonly executionId: string;
  readonly sequence: bigint;
  readonly createdAt: Date;
  
  // ─── P5.6 Snapshot Integrity & P5.21 Aggregate Version ───
  readonly aggregateVersion: number;
  readonly snapshotHash?: string;
  readonly eventChecksum?: string;
  readonly aggregateChecksum?: string;
  readonly tenantId: string;
  // ──────────────────────────────────────────────────────────
  
  readonly state: {
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    readonly workingMemory: Record<string, any>;
    readonly messages: Array<{
      role: 'system' | 'user' | 'assistant' | 'tool';
      content: string;
      toolCalls?: Array<{ id: string; name: string; arguments: string }>;
      toolCallId?: string;
    }>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    readonly context: Record<string, any>;
    readonly activeToolCalls: string[];
  };
}
