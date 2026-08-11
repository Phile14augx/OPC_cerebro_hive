
export interface AuditEvent {
  traceId: string;
  spanId: string;
  tenant: string;
  actor: string;
  action: string;
  timestamp: string;
  immutableHash: string;
}

export class AuditService {
  logEvent(event: Omit<AuditEvent, 'timestamp' | 'immutableHash'>) {
    const fullEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      immutableHash: 'sha256-mock-hash'
    };
    console.log(`[Audit] IMMUTABLE LOG: [${fullEvent.traceId}] ${fullEvent.actor} -> ${fullEvent.action}`);
  }
}
