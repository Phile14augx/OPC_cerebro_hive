/**
 * forge-api — EventsService
 * Real-time NATS JetStream event fan-out over SSE.
 *
 * Subscribes to cerebro.> on a durable consumer and pushes
 * filtered events to per-connection Response objects.
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import type { Response } from "express";
import {
  connect,
  type NatsConnection,
  type JetStreamManager,
  type JetStreamClient,
  type ConsumerMessages,
  StringCodec,
  StorageType,
  AckPolicy,
  DeliverPolicy,
} from "nats";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventConnection {
  res:          Response;
  orgId:        string;
  domainFilter: string | null;
  searchFilter: string | null;
}

export interface NatsEvent {
  id:        string;
  subject:   string;
  domain:    string;
  payload:   Record<string, unknown>;
  timestamp: number;
  sequence:  number;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);
  private nc:      NatsConnection | null  = null;
  private jsm:     JetStreamManager | null = null;
  private js:      JetStreamClient | null  = null;
  private msgs:    ConsumerMessages | null  = null;

  private readonly sc          = StringCodec();
  private readonly connections = new Map<string, EventConnection>();

  get connectionCount(): number { return this.connections.size; }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  async onModuleInit(): Promise<void> {
    const url = process.env["NATS_URL"] ?? "nats://localhost:4222";

    try {
      this.nc  = await connect({ servers: url, name: "forge-api-events" });
      this.jsm = await this.nc.jetstreamManager();
      this.js  = this.nc.jetstream();

      await this.ensureStream();
      void this.startConsuming();
      this.logger.log(`Events service connected to NATS at ${url}`);
    } catch (err) {
      this.logger.error("Failed to connect to NATS — events SSE will be unavailable", err);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.msgs?.close();
    await this.nc?.drain();
  }

  // ── Stream setup ────────────────────────────────────────────────────────────

  private async ensureStream(): Promise<void> {
    if (!this.jsm) return;
    try {
      await this.jsm.streams.info("CEREBRO");
    } catch {
      await this.jsm.streams.add({
        name:        "CEREBRO",
        subjects:    ["cerebro.>"],
        max_age:     24 * 60 * 60 * 1e9,   // 24h in nanoseconds
        max_msgs:    5_000_000,
        storage:     StorageType.File,
        num_replicas: 1,
      });
    }
  }

  // ── Consumer loop ───────────────────────────────────────────────────────────

  private async startConsuming(): Promise<void> {
    if (!this.js) return;

    try {
      await this.jsm?.consumers.add("CEREBRO", {
        durable_name:    "forge-api-events-fan-out",
        ack_policy:      AckPolicy.Explicit,
        deliver_policy:  DeliverPolicy.New,
        filter_subject:  "cerebro.>",
        max_ack_pending: 1000,
      });
    } catch {
      // Already exists — that's fine
    }

    const consumer = await this.js.consumers.get("CEREBRO", "forge-api-events-fan-out");
    this.msgs      = await consumer.consume({ max_messages: 1000 });

    for await (const msg of this.msgs) {
      msg.ack();

      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(this.sc.decode(msg.data)) as Record<string, unknown>;
      } catch {
        // Non-JSON message — pass raw
        payload = { raw: this.sc.decode(msg.data) };
      }

      const event: NatsEvent = {
        id:        msg.headers?.get("Nats-Msg-Id") ?? crypto.randomUUID(),
        subject:   msg.subject,
        domain:    msg.subject.split(".")[1] ?? "unknown",
        payload,
        timestamp: Date.now(),
        sequence:  msg.seq,
      };

      this.broadcast(event, payload["orgId"] as string | undefined);
    }
  }

  // ── SSE fan-out ─────────────────────────────────────────────────────────────

  private broadcast(event: NatsEvent, orgId?: string): void {
    for (const [connId, conn] of this.connections) {
      // Org isolation — only broadcast to matching org
      if (conn.orgId && orgId && conn.orgId !== orgId) continue;

      // Domain filter
      if (conn.domainFilter && event.domain !== conn.domainFilter) continue;

      // Search filter (subject substring)
      if (conn.searchFilter && !event.subject.includes(conn.searchFilter)) continue;

      const data = JSON.stringify(event);

      try {
        conn.res.write(`id: ${event.id}\n`);
        conn.res.write(`event: ${event.domain}\n`);
        conn.res.write(`data: ${data}\n\n`);
        (conn.res as { flush?: () => void }).flush?.();
      } catch {
        // Client disconnected
        this.connections.delete(connId);
      }
    }
  }

  // ── Connection management ────────────────────────────────────────────────────

  subscribe(
    connId:       string,
    orgId:        string,
    res:          Response,
    domainFilter: string | null = null,
    searchFilter: string | null = null,
  ): () => void {
    this.connections.set(connId, { res, orgId, domainFilter, searchFilter });
    this.logger.debug(`SSE event connection opened: ${connId} (org=${orgId})`);

    // Send a connected ping
    res.write(`event: connected\ndata: ${JSON.stringify({ connId, timestamp: Date.now() })}\n\n`);
    (res as { flush?: () => void }).flush?.();

    return () => {
      this.connections.delete(connId);
      this.logger.debug(`SSE event connection closed: ${connId}`);
    };
  }
}
