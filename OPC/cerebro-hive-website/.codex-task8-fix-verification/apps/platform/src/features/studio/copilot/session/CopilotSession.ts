
/**
 * Session-scoped conversation context.
 *
 * Retains only immutable artifact references (executionId, workflowId,
 * simulationRunId) so multi-turn follow-ups like "now reduce latency too"
 * can resolve to the same artifacts without relying on opaque hidden state.
 *
 * Every action is still independently reproducible from the artifact refs.
 * Sessions do not persist across server restarts — bounded, auditable scope.
 */

export interface SessionArtifact {
  type: 'workflow' | 'execution' | 'simulation' | 'plannerTrace' | 'optimization';
  id: string;
  label: string;
  createdAt: Date;
}

export class CopilotSession {
  public readonly artifacts: SessionArtifact[] = [];
  public readonly turnHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  public readonly createdAt = new Date();

  constructor(public readonly sessionId: string) {}

  addArtifact(artifact: SessionArtifact) {
    this.artifacts.push(artifact);
  }

  addTurn(role: 'user' | 'assistant', content: string) {
    this.turnHistory.push({ role, content });
    // Bounded retention — keep last 20 turns to prevent unbounded memory growth
    if (this.turnHistory.length > 20) this.turnHistory.shift();
  }

  getRecentContext(): string {
    return this.turnHistory.slice(-6).map(t => `${t.role}: ${t.content}`).join('\n');
  }
}
