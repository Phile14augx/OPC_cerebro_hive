
// Mock PostgreSQL backed state store
export class ExecutionStateStore {
  private states = new Map<string, any>();
  
  async saveContext(taskId: string, context: any) {
    this.states.set(taskId, context);
  }
  
  async getContext(taskId: string) {
    return this.states.get(taskId) || {};
  }
}

// Mock Blob Storage for large artifacts
export class ArtifactStore {
  async saveArtifact(payload: any): Promise<string> {
    const ref = `art-${Date.now()}`;
    console.log(`[ArtifactStore] Saved large payload to object storage. Ref: ${ref}`);
    return ref;
  }
}
