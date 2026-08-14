/**
 * @module runtime-core/mission
 * Mission domain model and in-memory repository.
 *
 * A Mission is the top-level unit of work in the Nexarch AOS.
 * It consists of a declared objective, a set of tasks, and the agents
 * assigned to fulfil them.  Missions may be nested (parentMissionId) to
 * support hierarchical planning.
 */

import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MissionStatus =
  | "draft"
  | "planning"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type MissionEventType =
  | "created"
  | "planning_started"
  | "agent_assigned"
  | "agent_removed"
  | "task_added"
  | "task_completed"
  | "task_failed"
  | "status_changed"
  | "paused"
  | "resumed"
  | "completed"
  | "failed"
  | "cancelled"
  | "artifact_added"
  | "comment"
  | "error";

export interface MissionConstraints {
  /** ISO-8601 deadline. */
  deadline?: string;
  /** Maximum total spend in USD. */
  maxCostUsd?: number;
  /** "low" | "medium" | "high" | "critical" */
  riskTolerance: "low" | "medium" | "high" | "critical";
  /**
   * Number of human approvals required before the mission can transition to
   * "running".  0 = no approval gate.
   */
  requiredApprovals: number;
}

export interface MissionEvent {
  eventId: string;
  type: MissionEventType;
  /** The agent instance that produced the event, if applicable. */
  agentId?: string;
  message: string;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Arbitrary structured payload. */
  data?: Record<string, unknown>;
}

export type MissionArtifactType =
  | "document"
  | "image"
  | "code"
  | "dataset"
  | "report"
  | "model"
  | "other";

export interface MissionArtifact {
  artifactId: string;
  name: string;
  type: MissionArtifactType;
  /** URL to external storage (e.g. S3 pre-signed URL). */
  url?: string;
  /** Inline data for small payloads. */
  data?: Record<string, unknown>;
  /** Agent instanceId that produced this artifact. */
  createdBy: string;
  createdAt: string;
  /** MIME type, e.g. "application/pdf". */
  mimeType?: string;
  /** Byte size of the artifact content. */
  sizeBytes?: number;
}

export interface Mission {
  missionId: string;
  title: string;
  description: string;
  /** Clear, measurable objective statement. */
  objective: string;

  tenantId: string;
  workspaceId: string;
  /** Agent instanceId or user identity that created the mission. */
  createdBy: string;

  status: MissionStatus;
  constraints: MissionConstraints;

  /** Agent instanceIds assigned to this mission. */
  assignedAgents: string[];
  /** Task IDs belonging to this mission. */
  taskIds: string[];

  /** For sub-missions created by planning agents. */
  parentMissionId?: string;

  /** Ordered log of mission lifecycle events. */
  events: MissionEvent[];
  /** Outputs and by-products generated during mission execution. */
  artifacts: MissionArtifact[];

  metadata: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// CreateMission input
// ---------------------------------------------------------------------------

export type CreateMissionInput = Omit<
  Mission,
  | "missionId"
  | "status"
  | "assignedAgents"
  | "taskIds"
  | "events"
  | "artifacts"
  | "createdAt"
  | "updatedAt"
  | "completedAt"
> & {
  missionId?: string;
  status?: MissionStatus;
};

// ---------------------------------------------------------------------------
// Repository interface
// ---------------------------------------------------------------------------

export interface MissionRepository {
  /**
   * Persist a new Mission.  Throws if the missionId already exists.
   */
  create(input: CreateMissionInput): Promise<Mission>;

  /**
   * Retrieve a Mission by ID.  Returns undefined if not found.
   */
  get(missionId: string): Promise<Mission | undefined>;

  /**
   * Retrieve a Mission by ID.  Throws if not found.
   */
  getOrThrow(missionId: string): Promise<Mission>;

  /**
   * Apply a partial update to an existing mission.
   * `updatedAt` is always refreshed automatically.
   * Returns the updated Mission.
   */
  update(
    missionId: string,
    patch: Partial<
      Omit<Mission, "missionId" | "tenantId" | "createdAt" | "events" | "artifacts">
    >,
  ): Promise<Mission>;

  /**
   * Return all missions, optionally filtered.
   */
  list(filter?: MissionListFilter): Promise<Mission[]>;

  /**
   * Append a MissionEvent to the mission's event log.
   */
  addEvent(missionId: string, event: Omit<MissionEvent, "eventId" | "timestamp">): Promise<MissionEvent>;

  /**
   * Attach an artifact to the mission.
   */
  addArtifact(missionId: string, artifact: Omit<MissionArtifact, "artifactId" | "createdAt">): Promise<MissionArtifact>;

  /**
   * Delete a mission.  Idempotent (no error if not found).
   */
  delete(missionId: string): Promise<void>;
}

export interface MissionListFilter {
  tenantId?: string;
  workspaceId?: string;
  status?: MissionStatus;
  createdBy?: string;
  parentMissionId?: string | null; // null = root missions only
  assignedAgentId?: string;
  /** Return missions created at or after this ISO-8601 timestamp. */
  createdAfter?: string;
  /** Return missions created at or before this ISO-8601 timestamp. */
  createdBefore?: string;
}

// ---------------------------------------------------------------------------
// MissionNotFoundError
// ---------------------------------------------------------------------------

export class MissionNotFoundError extends Error {
  constructor(missionId: string) {
    super(`Mission not found: "${missionId}"`);
    this.name = "MissionNotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MissionAlreadyExistsError extends Error {
  constructor(missionId: string) {
    super(`Mission already exists: "${missionId}"`);
    this.name = "MissionAlreadyExistsError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// InMemoryMissionRepository
// ---------------------------------------------------------------------------

export class InMemoryMissionRepository implements MissionRepository {
  private readonly store = new Map<string, Mission>();

  async create(input: CreateMissionInput): Promise<Mission> {
    const now = new Date().toISOString();
    const missionId = input.missionId ?? randomUUID();

    if (this.store.has(missionId)) {
      throw new MissionAlreadyExistsError(missionId);
    }

    const mission: Mission = {
      missionId,
      title: input.title,
      description: input.description,
      objective: input.objective,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      createdBy: input.createdBy,
      status: input.status ?? "draft",
      constraints: { ...input.constraints },
      assignedAgents: [],
      taskIds: [],
      parentMissionId: input.parentMissionId,
      events: [],
      artifacts: [],
      metadata: input.metadata ? { ...input.metadata } : {},
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(missionId, mission);

    // Emit a creation event.
    await this.addEvent(missionId, {
      type: "created",
      message: `Mission "${mission.title}" created by "${mission.createdBy}".`,
    });

    return this.deepClone(mission);
  }

  async get(missionId: string): Promise<Mission | undefined> {
    const m = this.store.get(missionId);
    return m ? this.deepClone(m) : undefined;
  }

  async getOrThrow(missionId: string): Promise<Mission> {
    const m = await this.get(missionId);
    if (!m) throw new MissionNotFoundError(missionId);
    return m;
  }

  async update(
    missionId: string,
    patch: Partial<Omit<Mission, "missionId" | "tenantId" | "createdAt" | "events" | "artifacts">>,
  ): Promise<Mission> {
    const mission = this.requireMission(missionId);
    const now = new Date().toISOString();

    // Apply patch fields.
    for (const [key, value] of Object.entries(patch) as Array<[keyof typeof patch, unknown]>) {
      if (value !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mission as any)[key] = value;
      }
    }

    mission.updatedAt = now;

    // Automatically set completedAt when transitioning to a terminal status.
    if (
      patch.status &&
      ["completed", "failed", "cancelled"].includes(patch.status) &&
      !mission.completedAt
    ) {
      mission.completedAt = now;
    }

    return this.deepClone(mission);
  }

  async list(filter?: MissionListFilter): Promise<Mission[]> {
    let results = Array.from(this.store.values());

    if (!filter) return results.map((m) => this.deepClone(m));

    if (filter.tenantId !== undefined) {
      results = results.filter((m) => m.tenantId === filter.tenantId);
    }
    if (filter.workspaceId !== undefined) {
      results = results.filter((m) => m.workspaceId === filter.workspaceId);
    }
    if (filter.status !== undefined) {
      results = results.filter((m) => m.status === filter.status);
    }
    if (filter.createdBy !== undefined) {
      results = results.filter((m) => m.createdBy === filter.createdBy);
    }
    if (filter.parentMissionId === null) {
      results = results.filter((m) => !m.parentMissionId);
    } else if (filter.parentMissionId !== undefined) {
      results = results.filter((m) => m.parentMissionId === filter.parentMissionId);
    }
    if (filter.assignedAgentId !== undefined) {
      results = results.filter((m) => m.assignedAgents.includes(filter.assignedAgentId!));
    }
    if (filter.createdAfter !== undefined) {
      const after = filter.createdAfter;
      results = results.filter((m) => m.createdAt >= after);
    }
    if (filter.createdBefore !== undefined) {
      const before = filter.createdBefore;
      results = results.filter((m) => m.createdAt <= before);
    }

    // Sort by createdAt descending (most recent first).
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return results.map((m) => this.deepClone(m));
  }

  async addEvent(
    missionId: string,
    event: Omit<MissionEvent, "eventId" | "timestamp">,
  ): Promise<MissionEvent> {
    const mission = this.requireMission(missionId);
    const now = new Date().toISOString();

    const full: MissionEvent = {
      eventId: randomUUID(),
      type: event.type,
      agentId: event.agentId,
      message: event.message,
      timestamp: now,
      data: event.data ? { ...event.data } : undefined,
    };

    mission.events.push(full);
    mission.updatedAt = now;

    return { ...full };
  }

  async addArtifact(
    missionId: string,
    artifact: Omit<MissionArtifact, "artifactId" | "createdAt">,
  ): Promise<MissionArtifact> {
    const mission = this.requireMission(missionId);
    const now = new Date().toISOString();

    const full: MissionArtifact = {
      artifactId: randomUUID(),
      name: artifact.name,
      type: artifact.type,
      url: artifact.url,
      data: artifact.data ? { ...artifact.data } : undefined,
      createdBy: artifact.createdBy,
      createdAt: now,
      mimeType: artifact.mimeType,
      sizeBytes: artifact.sizeBytes,
    };

    mission.artifacts.push(full);
    mission.updatedAt = now;

    // Emit artifact event.
    await this.addEvent(missionId, {
      type: "artifact_added",
      agentId: artifact.createdBy,
      message: `Artifact "${artifact.name}" (${artifact.type}) attached to mission.`,
      data: { artifactId: full.artifactId, artifactName: full.name },
    });

    return { ...full };
  }

  async delete(missionId: string): Promise<void> {
    this.store.delete(missionId);
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private requireMission(missionId: string): Mission {
    const m = this.store.get(missionId);
    if (!m) throw new MissionNotFoundError(missionId);
    return m;
  }

  /**
   * Deep clone a Mission to prevent callers from mutating the internal store.
   */
  private deepClone(m: Mission): Mission {
    return {
      ...m,
      constraints: { ...m.constraints },
      assignedAgents: [...m.assignedAgents],
      taskIds: [...m.taskIds],
      events: m.events.map((e) => ({
        ...e,
        data: e.data ? { ...e.data } : undefined,
      })),
      artifacts: m.artifacts.map((a) => ({
        ...a,
        data: a.data ? { ...a.data } : undefined,
      })),
      metadata: { ...m.metadata },
    };
  }

  // -------------------------------------------------------------------------
  // Convenience query helpers (not part of the interface)
  // -------------------------------------------------------------------------

  /**
   * Return the total number of missions in the store.
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Clear all missions (useful for testing).
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Return aggregate status counts.
   */
  getStatusSummary(): Record<MissionStatus, number> {
    const summary: Record<MissionStatus, number> = {
      draft: 0,
      planning: 0,
      running: 0,
      paused: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const m of this.store.values()) {
      summary[m.status] = (summary[m.status] ?? 0) + 1;
    }

    return summary;
  }
}
