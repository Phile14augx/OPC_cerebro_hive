import { newId } from "../ids/id.js";
import type { EventBus } from "../events/events.js";
import { Subjects } from "../events/events.js";

export interface AuditEntry {
  id: string; organizationId: string; actor: string; action: string;
  resource: string; resourceId?: string; details: Record<string, unknown>; traceId?: string; createdAt: string;
}

export interface AuditRepository {
  append(entry: AuditEntry): Promise<void>;
  list(organizationId: string, opts?: { limit?: number; resource?: string }): Promise<AuditEntry[]>;
}

export class InMemoryAuditRepository implements AuditRepository {
  entries: AuditEntry[] = [];
  async append(entry: AuditEntry): Promise<void> { this.entries.push(entry); }
  async list(organizationId: string, opts?: { limit?: number; resource?: string }): Promise<AuditEntry[]> {
    let out = this.entries.filter(e => e.organizationId === organizationId);
    if (opts?.resource) out = out.filter(e => e.resource === opts.resource);
    return out.slice(-1 * (opts?.limit ?? 100)).reverse();
  }
}

export class AuditService {
  constructor(private readonly repo: AuditRepository, private readonly bus: EventBus) {}

  async record(input: Omit<AuditEntry, "id" | "createdAt">): Promise<AuditEntry> {
    const entry: AuditEntry = { ...input, id: newId("aud"), createdAt: new Date().toISOString() };
    await this.repo.append(entry);
    await this.bus.publish(Subjects.governance.auditRecorded, {
      action: entry.action, resource: entry.resource, resourceId: entry.resourceId ?? null,
    }, { organizationId: entry.organizationId, actor: entry.actor, traceId: entry.traceId });
    return entry;
  }

  list(organizationId: string, opts?: { limit?: number; resource?: string }): Promise<AuditEntry[]> {
    return this.repo.list(organizationId, opts);
  }
}
