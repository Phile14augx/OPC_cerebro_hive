import pg from "pg";
import type { Logger } from "../logging/logger.js";

export interface Snapshotable { dump(): unknown; restore(data: unknown): void }

/**
 * Durable state for in-memory domain repositories: periodic JSON snapshots into
 * Postgres. Domain repos keep clean interfaces so table-backed implementations
 * can replace them without touching services; until then this provides real
 * restart durability on a single node.
 */
export class SnapshotPersistence {
  private registry = new Map<string, Snapshotable>();
  private timer?: ReturnType<typeof setInterval>;
  private client?: pg.Pool;

  constructor(private readonly databaseUrl: string, private readonly logger: Logger, private readonly intervalMs = 20_000) {}

  register(name: string, target: Snapshotable): void { this.registry.set(name, target); }

  async start(): Promise<void> {
    this.client = new pg.Pool({ connectionString: this.databaseUrl, max: 2 });
    await this.client.query("CREATE TABLE IF NOT EXISTS platform_snapshots (name text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())");
    for (const [name, target] of this.registry) {
      try {
        const res = await this.client.query("SELECT data FROM platform_snapshots WHERE name = $1", [name]);
        if (res.rows[0]) target.restore(res.rows[0].data);
      } catch (err) { this.logger.warn({ err: String(err), name }, "snapshot restore failed"); }
    }
    this.timer = setInterval(() => { void this.flush(); }, this.intervalMs);
    this.logger.info({ stores: this.registry.size }, "snapshot persistence active");
  }

  async flush(): Promise<void> {
    if (!this.client) return;
    for (const [name, target] of this.registry) {
      try {
        await this.client.query(
          "INSERT INTO platform_snapshots (name, data, updated_at) VALUES ($1, $2, now()) ON CONFLICT (name) DO UPDATE SET data = $2, updated_at = now()",
          [name, JSON.stringify(target.dump())],
        );
      } catch (err) { this.logger.warn({ err: String(err), name }, "snapshot flush failed"); }
    }
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    await this.flush();
    await this.client?.end();
  }
}

/** Helpers to make Map/array-backed repos snapshotable. */
export function mapSnapshot<V>(map: Map<string, V>): Snapshotable {
  return {
    dump: () => [...map.entries()],
    restore: data => { if (Array.isArray(data)) { map.clear(); for (const [k, v] of data as [string, V][]) map.set(k, v); } },
  };
}
export function arraySnapshot<V>(arr: V[]): Snapshotable {
  return {
    dump: () => arr,
    restore: data => { if (Array.isArray(data)) { arr.length = 0; arr.push(...(data as V[])); } },
  };
}
export function comboSnapshot(parts: Record<string, Snapshotable>): Snapshotable {
  return {
    dump: () => Object.fromEntries(Object.entries(parts).map(([k, p]) => [k, p.dump()])),
    restore: data => {
      if (data && typeof data === "object") {
        for (const [k, p] of Object.entries(parts)) {
          const d = (data as Record<string, unknown>)[k];
          if (d !== undefined) p.restore(d);
        }
      }
    },
  };
}
