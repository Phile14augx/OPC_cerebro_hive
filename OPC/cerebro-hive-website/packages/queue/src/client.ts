/**
 * @cerebro/queue — NATS JetStream typed client
 * Wraps nats.js with schema validation (Zod), DLQ routing, retry policy,
 * and strongly-typed publish/subscribe APIs.
 */

import {
  connect,
  type NatsConnection,
  type JetStreamClient,
  type JetStreamManager,
  type NatsError,
  type Msg,
  StringCodec,
  JSONCodec,
  AckPolicy,
  DeliverPolicy,
  RetentionPolicy,
  StorageType,
  ReplayPolicy,
} from "nats";
import { z, type ZodTypeAny } from "zod";
import { STREAMS, dlqSubject, type StreamConfig } from "./subjects.js";

// ── Codec ─────────────────────────────────────────────────────────────────────

const jc = JSONCodec<unknown>();

// ── Publish options ───────────────────────────────────────────────────────────

export interface PublishOptions {
  /** Message-level deduplication ID (NATS Nuid or your own ID) */
  msgId?:      string;
  /** Override expected last msg ID for idempotent publishes */
  expectedLastMsgId?: string;
  traceId?:    string;
  headers?:    Record<string, string>;
}

// ── Consumer config ───────────────────────────────────────────────────────────

export interface ConsumeOptions<T> {
  /** Consumer durable name */
  durable:    string;
  /** Subject filter within stream */
  subject:    string;
  /** Zod schema to validate incoming messages */
  schema?:    ZodTypeAny;
  /** Max retry count before DLQ routing */
  maxRetries?: number;
  /** Per-message handler */
  handler:    (msg: T, raw: Msg) => Promise<void>;
  /** Optional error handler */
  onError?:   (err: unknown, raw: Msg) => Promise<void>;
}

// ── Client ────────────────────────────────────────────────────────────────────

export class CerebroQueueClient {
  private nc:  NatsConnection | null  = null;
  private js:  JetStreamClient | null = null;
  private jsm: JetStreamManager | null = null;

  async connect(servers: string | string[] = process.env["NATS_URL"] ?? "nats://localhost:4222"): Promise<void> {
    this.nc = await connect({
      servers,
      reconnect:      true,
      maxReconnectAttempts: -1,
      reconnectTimeWait:    2000,
      pingInterval:         30_000,
      maxPingOut:           3,
      name:                 "cerebro-platform",
    });

    this.js  = this.nc.jetstream();
    this.jsm = await this.nc.jetstreamManager();

    // Bootstrap streams on first connect
    await this.ensureStreams();

    this.nc.closed().then(() => {
      console.warn("[queue] NATS connection closed");
    }).catch((err: unknown) => {
      console.error("[queue] NATS connection error:", err);
    });
  }

  async disconnect(): Promise<void> {
    await this.nc?.drain();
    await this.nc?.close();
  }

  // ── Stream bootstrap ──────────────────────────────────────────────────────

  private async ensureStreams(): Promise<void> {
    if (!this.jsm) throw new Error("JetStream manager not initialized");

    for (const cfg of STREAMS) {
      try {
        await this.jsm.streams.info(cfg.name);
        // Stream exists — update if needed
        await this.jsm.streams.update(cfg.name, {
          subjects:    cfg.subjects,
          max_age:     cfg.maxAge,
          max_bytes:   cfg.maxBytes,
          num_replicas: cfg.replicas,
          description: cfg.description,
        });
      } catch {
        // Stream doesn't exist — create
        await this.jsm.streams.add({
          name:        cfg.name,
          subjects:    cfg.subjects,
          max_age:     cfg.maxAge,
          max_bytes:   cfg.maxBytes,
          num_replicas: cfg.replicas,
          retention:   cfg.retention === "limits" ? RetentionPolicy.Limits
                     : cfg.retention === "interest" ? RetentionPolicy.Interest
                     : RetentionPolicy.Workqueue,
          storage:     cfg.storage === "file" ? StorageType.File : StorageType.Memory,
          description: cfg.description,
          deny_delete: false,
          deny_purge:  false,
        });
      }
    }
  }

  // ── Publish ───────────────────────────────────────────────────────────────

  async publish<T extends Record<string, unknown>>(
    subject: string,
    payload: T,
    opts:    PublishOptions = {},
  ): Promise<string> {
    if (!this.js) throw new Error("Not connected");

    const enriched = {
      ...payload,
      _meta: {
        traceId:   opts.traceId  ?? null,
        timestamp: new Date().toISOString(),
        subject,
      },
    };

    const pubHeaders = this.js ? undefined : undefined; // nats headers if needed
    const ack = await this.js.publish(subject, jc.encode(enriched), {
      msgID:              opts.msgId,
      expectedLastMsgID:  opts.expectedLastMsgId,
    });

    return `${ack.stream}:${ack.seq}`;
  }

  // ── Subscribe (push consumer) ─────────────────────────────────────────────

  async subscribe<T>(options: ConsumeOptions<T>): Promise<() => void> {
    if (!this.js) throw new Error("Not connected");

    const consumer = await this.js.pullSubscribe(options.subject, {
      config: {
        durable_name:     options.durable,
        ack_policy:       AckPolicy.Explicit,
        deliver_policy:   DeliverPolicy.All,
        replay_policy:    ReplayPolicy.Instant,
        max_deliver:      (options.maxRetries ?? 3) + 1,
        ack_wait:         30 * 1e9,  // 30 seconds in nanoseconds
        filter_subject:   options.subject,
      },
    });

    let running = true;

    const loop = async (): Promise<void> => {
      while (running) {
        try {
          consumer.pull({ batch: 10, expires: 5000 });

          for await (const raw of consumer) {
            await this.handleMessage(raw, options);
          }
        } catch (err) {
          if (running) {
            console.error("[queue] Consumer error, restarting:", err);
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
    };

    void loop();

    return () => { running = false; consumer.unsubscribe(); };
  }

  private async handleMessage<T>(raw: Msg, options: ConsumeOptions<T>): Promise<void> {
    const maxRetries = options.maxRetries ?? 3;
    const deliverCount = raw.info?.deliveryCount ?? 1;

    try {
      let payload = jc.decode(raw.data) as T;

      if (options.schema) {
        const result = options.schema.safeParse(payload);
        if (!result.success) {
          console.error("[queue] Schema validation failed:", result.error.flatten());
          // Invalid messages go straight to DLQ — don't retry
          await this.routeToDLQ(raw, "SCHEMA_VALIDATION_FAILED", result.error.message);
          raw.ack();
          return;
        }
        payload = result.data as T;
      }

      await options.handler(payload, raw);
      raw.ack();
    } catch (err) {
      if (deliverCount > maxRetries) {
        // Exhausted retries → DLQ
        const errMsg = err instanceof Error ? err.message : String(err);
        await this.routeToDLQ(raw, "MAX_RETRIES_EXCEEDED", errMsg);
        raw.ack(); // Ack to prevent further delivery

        if (options.onError) {
          await options.onError(err, raw).catch(console.error);
        }
      } else {
        // NAK with back-off — NATS will redeliver
        const backoffMs = Math.min(1000 * 2 ** (deliverCount - 1), 30_000);
        raw.nak(backoffMs);
      }
    }
  }

  private async routeToDLQ(original: Msg, reason: string, detail: string): Promise<void> {
    if (!this.js) return;

    const dlq = dlqSubject(original.subject);
    try {
      await this.js.publish(dlq, jc.encode({
        originalSubject: original.subject,
        originalPayload: jc.decode(original.data),
        reason,
        detail,
        failedAt:        new Date().toISOString(),
        headers:         original.headers ? Object.fromEntries(original.headers) : {},
      }));
    } catch (err) {
      console.error("[queue] Failed to route to DLQ:", err);
    }
  }

  // ── Health ────────────────────────────────────────────────────────────────

  get isConnected(): boolean {
    return this.nc !== null && !this.nc.isClosed();
  }

  async healthCheck(): Promise<{ connected: boolean; rtt: number | null }> {
    if (!this.nc || this.nc.isClosed()) return { connected: false, rtt: null };
    try {
      const start = Date.now();
      await this.nc.flush();
      return { connected: true, rtt: Date.now() - start };
    } catch {
      return { connected: false, rtt: null };
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

const globalForQueue = globalThis as unknown as { queue: CerebroQueueClient | undefined };
export const queue: CerebroQueueClient = globalForQueue.queue ?? new CerebroQueueClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForQueue.queue = queue;
}

process.on("beforeExit", () => { void queue.disconnect(); });
