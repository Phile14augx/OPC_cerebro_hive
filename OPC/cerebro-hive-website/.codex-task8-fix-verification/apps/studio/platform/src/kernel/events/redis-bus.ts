import { Redis } from "ioredis";
import { type EventBus, type EventEnvelope, type EventHandler, type Subscription, eventEnvelopeSchema, makeEnvelope, subjectMatches } from "./events.js";
import type { Logger } from "../logging/logger.js";

const STREAM = "cerebro:events";

/** Redis Streams event bus — consumer-group based fallback transport. */
export class RedisEventBus implements EventBus {
  readonly kind = "redis" as const;
  private readonly pub: Redis;
  private readonly stopped: { v: boolean } = { v: false };
  private readers: Redis[] = [];

  constructor(url: string, private readonly logger: Logger) {
    this.pub = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
  }

  async publish(subject: string, data: Record<string, unknown>, opts: { organizationId: string; actor?: string; traceId?: string }): Promise<EventEnvelope> {
    const env = makeEnvelope(subject, data, opts);
    await this.pub.xadd(STREAM, "MAXLEN", "~", "100000", "*", "payload", JSON.stringify(env));
    return env;
  }

  async subscribe(pattern: string, handler: EventHandler, opts?: { durable?: string }): Promise<Subscription> {
    const group = (opts?.durable ?? `grp-${pattern}`).replace(/[^a-zA-Z0-9_-]/g, "-");
    try { await this.pub.xgroup("CREATE", STREAM, group, "$", "MKSTREAM"); } catch { /* exists */ }
    const reader = this.pub.duplicate();
    this.readers.push(reader);
    const consumer = `c-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
    const loop = async () => {
      while (!this.stopped.v) {
        try {
          const res = await reader.xreadgroup("GROUP", group, consumer, "COUNT", 32, "BLOCK", 2000, "STREAMS", STREAM, ">") as [string, [string, string[]][]][] | null;
          if (!res) continue;
          for (const [, entries] of res) {
            for (const [id, fields] of entries) {
              const idx = fields.indexOf("payload");
              const raw = idx >= 0 ? fields[idx + 1] : undefined;
              if (raw) {
                const parsed = eventEnvelopeSchema.safeParse(JSON.parse(raw));
                if (parsed.success && subjectMatches(pattern, parsed.data.subject)) {
                  try { await handler(parsed.data); } catch (err) { this.logger.warn({ err: String(err) }, "handler failed"); }
                }
              }
              await reader.xack(STREAM, group, id);
            }
          }
        } catch (err) {
          if (!this.stopped.v) { this.logger.warn({ err: String(err) }, "redis bus read error"); await new Promise(r => setTimeout(r, 1000)); }
        }
      }
    };
    loop().catch(() => undefined);
    return { unsubscribe: async () => { reader.disconnect(); this.readers = this.readers.filter(r => r !== reader); } };
  }

  async close(): Promise<void> {
    this.stopped.v = true;
    for (const r of this.readers) r.disconnect();
    this.pub.disconnect();
  }
}
