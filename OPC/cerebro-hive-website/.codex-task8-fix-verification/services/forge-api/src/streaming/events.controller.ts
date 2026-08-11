/**
 * forge-api — EventsController
 * GET /v1/stream/events — SSE endpoint for real-time NATS events.
 *
 * Query params:
 *   domain  — filter by domain (workflow | agent | knowledge | ai | billing | audit | security)
 *   search  — substring match on subject
 */

import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { EventsService } from "./events.service.js";
import { JwtGuard } from "../auth/jwt.guard.js";

@Controller("stream")
@UseGuards(JwtGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /**
   * GET /v1/stream/events
   * SSE stream delivering real NATS JetStream messages to the browser.
   *
   * Headers set:
   *   Content-Type: text/event-stream
   *   Cache-Control: no-cache
   *   Connection: keep-alive
   *   X-Accel-Buffering: no  (disables Nginx buffering)
   */
  @Get("events")
  streamEvents(
    @Query("domain") domainFilter: string | undefined,
    @Query("search") searchFilter: string | undefined,
    @Req()  req: Request,
    @Res()  res: Response,
  ): void {
    const orgId  = req.auth?.orgId ?? "";
    const connId = randomUUID();

    res.setHeader("Content-Type",      "text/event-stream");
    res.setHeader("Cache-Control",     "no-cache");
    res.setHeader("Connection",        "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const cleanup = this.events.subscribe(
      connId,
      orgId,
      res,
      domainFilter ?? null,
      searchFilter ?? null,
    );

    // Keep-alive heartbeat every 20s (prevents proxy timeouts)
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
        (res as { flush?: () => void }).flush?.();
      } catch {
        clearInterval(heartbeat);
        cleanup();
      }
    }, 20_000);

    req.on("close", () => { clearInterval(heartbeat); cleanup(); });
    req.on("end",   () => { clearInterval(heartbeat); cleanup(); });
  }

  /** GET /v1/stream/events/health */
  @Get("events/health")
  eventsHealth() {
    return {
      connections: this.events.connectionCount,
      timestamp:   new Date().toISOString(),
    };
  }
}
