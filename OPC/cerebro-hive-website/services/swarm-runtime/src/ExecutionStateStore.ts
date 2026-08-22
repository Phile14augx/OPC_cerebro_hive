// Mock PostgreSQL backed state store
export class ExecutionStateStore {
  private states = new Map<string, Record<string, unknown>>();

  async saveContext(taskId: string, context: Record<string, unknown>) {
    this.states.set(taskId, context);
  }

  async getContext(taskId: string) {
    return this.states.get(taskId) || {};
  }
}

// Mock Blob Storage for large artifacts
export class ArtifactStore {
  async saveArtifact(_payload: unknown): Promise<string> {
    const ref = `art-${Date.now()}`;
    console.log(`[ArtifactStore] Saved large payload to object storage. Ref: ${ref}`);
    return ref;
  }

  async moveToDeadLetterQueue(taskId: string, error: Error): Promise<void> {
    console.error(`[ArtifactStore] Task ${taskId} moved to dead-letter queue: ${error.message}`);
  }
}
