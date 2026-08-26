/**
 * Integration tests — @cerebro/queue NATS JetStream client
 *
 * Requires NATS_URL in env (default: nats://localhost:4222)
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { connect, StringCodec, JetStreamManager, NatsConnection } from "nats";
import { z } from "zod";

const NATS_URL = process.env["NATS_URL"] ?? "nats://localhost:4222";

let nc: NatsConnection;
let jsm: JetStreamManager;

beforeAll(async () => {
  nc  = await connect({ servers: NATS_URL });
  jsm = await nc.jetstreamManager();
});

afterAll(async () => {
  await nc.drain();
});

// ── Stream management ─────────────────────────────────────────────────────────

const TEST_STREAM = `TEST_STREAM_${Date.now()}`;

describe("JetStream stream lifecycle", () => {
  it("creates a stream", async () => {
    const info = await jsm.streams.add({
      name:     TEST_STREAM,
      subjects: [`test.${TEST_STREAM}.>`],
    });
    expect(info.config.name).toBe(TEST_STREAM);
  });

  it("finds the created stream", async () => {
    const info = await jsm.streams.info(TEST_STREAM);
    expect(info.config.name).toBe(TEST_STREAM);
  });

  it("deletes the stream", async () => {
    const deleted = await jsm.streams.delete(TEST_STREAM);
    expect(deleted).toBe(true);
  });
});

// ── Publish / subscribe ───────────────────────────────────────────────────────

const PUB_STREAM  = `TEST_PUB_${Date.now()}`;
const PUB_SUBJECT = `test.${PUB_STREAM}.messages`;

describe("Publish and consume messages", () => {
  const sc = StringCodec();

  beforeAll(async () => {
    await jsm.streams.add({ name: PUB_STREAM, subjects: [`test.${PUB_STREAM}.>`] });
  });

  afterAll(async () => {
    await jsm.streams.delete(PUB_STREAM).catch(() => { /* */ });
  });

  it("publishes a message and acknowledges", async () => {
    const js  = nc.jetstream();
    const pa  = await js.publish(PUB_SUBJECT, sc.encode(JSON.stringify({ hello: "world" })));
    expect(pa.seq).toBeGreaterThan(0);
    expect(pa.duplicate).toBe(false);
  });

  it("consumes published message via pull consumer", async () => {
    const js = nc.jetstream();

    await jsm.consumers.add(PUB_STREAM, {
      durable_name: "test-consumer",
      ack_policy:   "explicit" as const,
    });

    const consumer = await js.consumers.get(PUB_STREAM, "test-consumer");
    const msgs     = await consumer.fetch({ max_messages: 1 });

    let received: string | null = null;
    for await (const msg of msgs) {
      received = sc.decode(msg.data);
      msg.ack();
      break;
    }

    expect(received).not.toBeNull();
    const parsed = JSON.parse(received!) as Record<string, unknown>;
    expect(parsed.hello).toBe("world");
  });

  it("message with invalid schema routes to DLQ concept (nak)", async () => {
    const js = nc.jetstream();

    // Publish intentionally malformed message
    await js.publish(PUB_SUBJECT, sc.encode("not-valid-json{{{"));

    const consumer = await js.consumers.get(PUB_STREAM, "test-consumer");
    const msgs     = await consumer.fetch({ max_messages: 1, expires: 2000 });

    let nakCalled = false;
    for await (const msg of msgs) {
      // In real code we'd validate and nak — here we just verify the message arrived
      // and we can nak it (which re-queues)
      try {
        JSON.parse(sc.decode(msg.data));
        msg.ack();
      } catch {
        msg.nak();
        nakCalled = true;
      }
      break;
    }

    expect(nakCalled).toBe(true);
  });
});

// ── Schema validation ─────────────────────────────────────────────────────────

const WorkflowStartedSchema = z.object({
  id:          z.string().uuid(),
  orgId:       z.string(),
  workflowId:  z.string(),
  executionId: z.string(),
  triggeredBy: z.string(),
  input:       z.record(z.unknown()),
  version:     z.number(),
});

describe("Zod schema validation", () => {
  it("validates a correct workflow started event", () => {
    const payload = {
      id:          crypto.randomUUID(),
      orgId:       "org_test",
      workflowId:  "wf_test",
      executionId: "exec_test",
      triggeredBy: "user_test",
      input:       { data: 42 },
      version:     1,
    };
    const result = WorkflowStartedSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects payload missing required fields", () => {
    const result = WorkflowStartedSchema.safeParse({ orgId: "org_test" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("rejects payload with wrong type", () => {
    const payload = {
      id:          "not-a-uuid",  // invalid UUID
      orgId:       "org_test",
      workflowId:  "wf_test",
      executionId: "exec_test",
      triggeredBy: "user_test",
      input:       {},
      version:     "1",  // should be number
    };
    const result = WorkflowStartedSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

// ── Backpressure / throughput ─────────────────────────────────────────────────

const THROUGHPUT_STREAM = `TEST_TP_${Date.now()}`;

describe("Throughput: 1000 messages in < 5s", () => {
  const MESSAGE_COUNT = 1000;

  beforeAll(async () => {
    await jsm.streams.add({
      name:     THROUGHPUT_STREAM,
      subjects: [`test.${THROUGHPUT_STREAM}.>`],
    });
  });

  afterAll(async () => {
    await jsm.streams.delete(THROUGHPUT_STREAM).catch(() => { /* */ });
  });

  it(`publishes ${MESSAGE_COUNT} messages within 5 seconds`, async () => {
    const js    = nc.jetstream();
    const sc    = StringCodec();
    const start = Date.now();

    await Promise.all(
      Array.from({ length: MESSAGE_COUNT }, (_, i) =>
        js.publish(
          `test.${THROUGHPUT_STREAM}.events`,
          sc.encode(JSON.stringify({ seq: i, ts: Date.now() })),
        ),
      ),
    );

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);

    // Verify stream received all messages
    const info = await jsm.streams.info(THROUGHPUT_STREAM);
    expect(info.state.messages).toBe(MESSAGE_COUNT);
  });
});
