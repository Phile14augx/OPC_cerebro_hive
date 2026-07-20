import { connect, StringCodec, type NatsConnection, type JetStreamManager, type JetStreamClient } from "nats";
import { type EventBus, type EventEnvelope, type EventHandler, type Subscription, eventEnvelopeSchema, makeEnvelope } from "./events.js";
import type { Logger } from "../logging/logger.js";

const sc = StringCodec();
const STREAMS: Record<string, string[]> = {
  RUNTIME: ["runtime.>", "reasoning.>", "mesh.>"],
  FLOW: ["flow.>"],
  KNOWLEDGE: ["knowledge.>", "memory.>"],
  SECURITY: ["security.>", "governance.>", "eval.>"],
  PLATFORM: ["platform.>", "ai.>", "simulator.>", "hub.>", "connect.>"],
};

/** NATS JetStream event bus — durable, at-least-once. */
export class NatsEventBus implements EventBus {
  readonly kind = "nats" as const;
  private nc!: NatsConnection;
  private js!: JetStreamClient;
  private jsm!: JetStreamManager;
  private constructor(private readonly logger: Logger) {}

  static async connect(url: string, logger: Logger): Promise<NatsEventBus> {
    const bus = new NatsEventBus(logger);
    bus.nc = await connect({ servers: url, name: "cerebro-platform", maxReconnectAttempts: -1 });
    bus.jsm = await bus.nc.jetstreamManager();
    bus.js = bus.nc.jetstream();
    for (const [name, subjects] of Object.entries(STREAMS)) {
      try { await bus.jsm.streams.info(name); }
      catch { await bus.jsm.streams.add({ name, subjects, max_age: 7 * 24 * 3600 * 1e9, max_msgs: 500_000 }); }
    }
    logger.info({ url }, "nats jetstream connected");
    return bus;
  }

  async publish(subject: string, data: Record<string, unknown>, opts: { organizationId: string; actor?: string; traceId?: string }): Promise<EventEnvelope> {
    const env = makeEnvelope(subject, data, opts);
    await this.js.publish(subject, sc.encode(JSON.stringify(env)), { msgID: env.id });
    return env;
  }

  async subscribe(pattern: string, handler: EventHandler, opts?: { durable?: string }): Promise<Subscription> {
    const durable = (opts?.durable ?? `plat-${pattern}`).replace(/[^a-zA-Z0-9_-]/g, "-");
    const sub = await this.js.subscribe(pattern, {
      config: { durable_name: durable, ack_policy: "explicit" as never, deliver_policy: "new" as never },
      queue: durable,
    } as never);
    (async () => {
      for await (const m of sub) {
        try {
          const parsed = eventEnvelopeSchema.safeParse(JSON.parse(sc.decode(m.data)));
          if (parsed.success) await handler(parsed.data);
          m.ack();
        } catch (err) {
          this.logger.warn({ err: String(err), pattern }, "event handler failed; nak");
          m.nak(2000);
        }
      }
    })().catch(err => this.logger.error({ err: String(err) }, "subscription loop crashed"));
    return { unsubscribe: async () => { await sub.drain(); } };
  }

  async close(): Promise<void> { await this.nc.drain(); }
}
