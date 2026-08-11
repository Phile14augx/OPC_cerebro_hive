export type SessionType = 'Interactive' | 'Api' | 'Job' | 'Workflow';

export interface Session {
  id: string;
  type: SessionType;
  principalId: string;
  startedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface SessionStore {
  createSession(session: Session): Promise<void>;
  getSession(id: string): Promise<Session | undefined>;
  revokeSession(id: string): Promise<void>;
}

export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, Session>();

  async createSession(session: Session): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async getSession(id: string): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (session && session.expiresAt && session.expiresAt < new Date()) {
      this.sessions.delete(id);
      return undefined;
    }
    return session;
  }

  async revokeSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }
}
