import { SandboxSession } from '../runtime/ISandboxRuntime';

export class ExecutionSessionRegistry {
  private readonly activeSessions = new Map<string, SandboxSession>();

  register(executionId: string, session: SandboxSession): void {
    if (this.activeSessions.has(executionId)) {
      throw new Error(`ExecutionId ${executionId} is already registered.`);
    }
    this.activeSessions.set(executionId, session);
  }

  getSession(executionId: string): SandboxSession | undefined {
    return this.activeSessions.get(executionId);
  }

  unregister(executionId: string): void {
    this.activeSessions.delete(executionId);
  }

  getAllActive(): SandboxSession[] {
    return Array.from(this.activeSessions.values());
  }
}
