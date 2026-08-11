import type { Db } from "../persistence/db.js";
import type { AuditEntry, AuditRepository } from "./audit.js";

export class PgAuditRepository implements AuditRepository {
  constructor(private readonly db: Db) {}
  async append(entry: AuditEntry): Promise<void> {
    await this.db.insertInto("audit_log").values({
      id: entry.id, organization_id: entry.organizationId, actor: entry.actor, action: entry.action,
      resource: entry.resource, resource_id: entry.resourceId ?? null, details: JSON.stringify(entry.details),
      trace_id: entry.traceId ?? null, created_at: new Date(entry.createdAt),
    }).execute();
  }
  async list(organizationId: string, opts?: { limit?: number; resource?: string }): Promise<AuditEntry[]> {
    let q = this.db.selectFrom("audit_log").selectAll().where("organization_id", "=", organizationId)
      .orderBy("created_at", "desc").limit(opts?.limit ?? 100);
    if (opts?.resource) q = q.where("resource", "=", opts.resource);
    const rows = await q.execute();
    return rows.map(r => ({
      id: r.id, organizationId: r.organization_id, actor: r.actor, action: r.action, resource: r.resource,
      resourceId: r.resource_id ?? undefined, details: JSON.parse(r.details), traceId: r.trace_id ?? undefined,
      createdAt: r.created_at.toISOString(),
    }));
  }
}
