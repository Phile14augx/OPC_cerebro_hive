/**
 * forge-api — StreamingController
 * SSE endpoint for real-time workflow execution events.
 */

import { Controller, Get, Param, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { StreamingService } from "./streaming.service.js";
import { JwtGuard } from "../auth/jwt.guard.js";

@Controller("stream")
@UseGuards(JwtGuard)
export class StreamingController {
  constructor(private readonly streaming: StreamingService) {}

  /**
   * GET /v1/stream/executions/:executionId
   * SSE stream for real-time execution events.
   * Client: EventSource(`/v1/stream/executions/${id}`)
   */
  @Get("executions/:executionId")
  async streamExecution(
    @Param("executionId") executionId: string,
    @Req()               req:         Request,
    @Res()               res:         Response,
  ): Promise<void> {
    const orgId = req.auth?.orgId ?? "";

    res.setHeader("Content-Type",  "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection",    "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable Nginx buffering
    res.flushHeaders();

    const cleanup = this.streaming.subscribe(executionId, orgId, res);

    // Cleanup when client disconnects
    req.on("close", cleanup);
    req.on("end",   cleanup);
  }

  /** GET /v1/stream/health — number of active SSE connections */
  @Get("health")
  streamHealth() {
    return { connections: this.streaming.connectionCount, timestamp: new Date().toISOString() };
  }
}
