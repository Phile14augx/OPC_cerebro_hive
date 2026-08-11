/**
 * forge-api — StreamingService
 * Manages SSE connections per execution and fan-out of execution events.
 */

import { Injectable, Logger } from "@nestjs/common";
import type { Response } from "express";
import { getForgeApiConfig } from "@cerebro/config";

export interface SSEClient {
  executionId: string;
  orgId:       string;
  res:         Response;
  connectedAt: Date;
}

export interface SSEEvent {
  event: string;
  data:  unknown;
  id?:   string;
}

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name);

  /** executionId → set of SSE clients */
  private readonly clients = new Map<string, Set<SSEClient>>();

  private readonly heartbeatIntervalMs: number;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    const cfg = getForgeApiConfig();
    this.heartbeatIntervalMs = cfg.SSE_HEARTBEAT_MS;
    this.startHeartbeat();
  }

  /** Register a new SSE subscriber for an execution. Returns cleanup fn. */
  subscribe(executionId: string, orgId: string, res: Response): () => void {
    const client: SSEClient = { executionId, orgId, res, connectedAt: new Date() };

    if (!this.clients.has(executionId)) {
      this.clients.set(executionId, new Set());
    }
    this.clients.get(executionId)!.add(client);

    this.logger.debug(`SSE client connected: ${executionId} (total: ${this.clients.get(executionId)!.size})`);

    // Send initial connection event
    this.sendToClient(client, { event: "connected", data: { executionId, timestamp: new Date().toISOString() } });

    const cleanup = () => this.unsubscribe(executionId, client);
    res.on("close", cleanup);

    return cleanup;
  }

  private unsubscribe(executionId: string, client: SSEClient): void {
    const set = this.clients.get(executionId);
    if (!set) return;
    set.delete(client);
    if (set.size === 0) this.clients.delete(executionId);
    this.logger.debug(`SSE client disconnected: ${executionId}`);
  }

  /** Broadcast an event to all subscribers of an execution. */
  emit(executionId: string, event: SSEEvent): void {
    const clients = this.clients.get(executionId);
    if (!clients?.size) return;

    for (const client of clients) {
      this.sendToClient(client, event);
    }
  }

  /** Broadcast to all subscribed executions for an org. */
  emitToOrg(orgId: string, event: SSEEvent): void {
    for (const [, clients] of this.clients) {
      for (const client of clients) {
        if (client.orgId === orgId) {
          this.sendToClient(client, event);
        }
      }
    }
  }

  private sendToClient(client: SSEClient, event: SSEEvent): void {
    try {
      if (client.res.writableEnded) return;
      const id   = event.id ? `id: ${event.id}\n` : "";
      const name = `event: ${event.event}\n`;
      const data = `data: ${JSON.stringify(event.data)}\n\n`;
      client.res.write(id + name + data);
    } catch (err) {
      this.logger.warn(`Failed to send SSE to client for ${client.executionId}:`, err);
      this.unsubscribe(client.executionId, client);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      for (const [, clients] of this.clients) {
        for (const client of clients) {
          this.sendToClient(client, {
            event: "heartbeat",
            data:  { timestamp: new Date().toISOString() },
          });
        }
      }
    }, this.heartbeatIntervalMs);

    this.heartbeatTimer.unref(); // Don't prevent process exit
  }

  get connectionCount(): number {
    let count = 0;
    for (const clients of this.clients.values()) count += clients.size;
    return count;
  }
}
