// ============================================================
// governance-core/src/audit-trail.ts
// ============================================================

import { createHash } from "crypto";
import { AuditEvent, AuditQueryFilter, ResourceType } from "./types";

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Produce a deterministic SHA-256 hash over the core event fields.
 * Useful for chain-of-custody verification.
 */
export function generateHash(event: AuditEvent): string {
  const deterministicFields = {
    eventId: event.eventId,
    timestamp: event.timestamp,
    tenantId: event.tenantId,
    agentId: event.agentId,
    who: event.who,
    what: event.what,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    operation: event.operation,
    outcomeSuccess: event.outcomeSuccess,
  };

  const canonical = JSON.stringify(deterministicFields, Object.keys(deterministicFields).sort());
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export class AuditTrail {
  private events: AuditEvent[] = [];

  /**
   * Append a new event to the immutable audit log.
   * eventId and timestamp are generated automatically.
   * A SHA-256 hash is computed and stored on the event.
   */
  record(
    eventData: Omit<AuditEvent, "eventId" | "timestamp">
  ): AuditEvent {
    const event: AuditEvent = {
      ...eventData,
      eventId: generateEventId(),
      timestamp: new Date().toISOString(),
    };

    // Compute integrity hash after setting eventId and timestamp
    event.hash = generateHash(event);

    // Append-only — never mutate existing records
    this.events.push(Object.freeze({ ...event }));
    return { ...event };
  }

  /**
   * Query events using filter criteria.
   * All provided filter fields are ANDed together.
   */
  query(filters: AuditQueryFilter): AuditEvent[] {
    return this.events
      .filter((e) => {
        if (filters.agentId !== undefined && e.agentId !== filters.agentId)
          return false;
        if (
          filters.instanceId !== undefined &&
          e.instanceId !== filters.instanceId
        )
          return false;
        if (
          filters.missionId !== undefined &&
          e.missionId !== filters.missionId
        )
          return false;
        if (filters.taskId !== undefined && e.taskId !== filters.taskId)
          return false;
        if (
          filters.operation !== undefined &&
          e.operation !== filters.operation
        )
          return false;
        if (
          filters.resourceType !== undefined &&
          e.resourceType !== filters.resourceType
        )
          return false;
        if (filters.tenantId !== undefined && e.tenantId !== filters.tenantId)
          return false;
        if (
          filters.outcomeSuccess !== undefined &&
          e.outcomeSuccess !== filters.outcomeSuccess
        )
          return false;
        if (filters.from !== undefined) {
          if (new Date(e.timestamp) < new Date(filters.from)) return false;
        }
        if (filters.to !== undefined) {
          if (new Date(e.timestamp) > new Date(filters.to)) return false;
        }
        return true;
      })
      .map((e) => ({ ...e }));
  }

  /**
   * Retrieve events for a specific agent, most-recent first.
   * @param agentId The agent identifier.
   * @param limit Maximum number of events to return (default: 100).
   */
  getForAgent(agentId: string, limit = 100): AuditEvent[] {
    return this.events
      .filter((e) => e.agentId === agentId)
      .slice(-limit)
      .reverse()
      .map((e) => ({ ...e }));
  }

  /**
   * Retrieve all events associated with a mission, in chronological order.
   */
  getForMission(missionId: string): AuditEvent[] {
    return this.events
      .filter((e) => e.missionId === missionId)
      .map((e) => ({ ...e }));
  }

  /**
   * Retrieve all events that reference a specific resource, in chronological order.
   */
  getForResource(resourceId: string): AuditEvent[] {
    return this.events
      .filter((e) => e.resourceId === resourceId)
      .map((e) => ({ ...e }));
  }

  /**
   * Total number of events stored.
   */
  count(): number {
    return this.events.length;
  }

  /**
   * Verify the integrity of a stored event by recomputing its hash.
   */
  verify(event: AuditEvent): boolean {
    if (!event.hash) return false;
    const recomputed = generateHash(event);
    return recomputed === event.hash;
  }
}
