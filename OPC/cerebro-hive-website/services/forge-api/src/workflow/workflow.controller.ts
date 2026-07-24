/**
 * forge-api — WorkflowController
 */

import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from "@nestjs/common";
import type { Request } from "express";
import { WorkflowService, type StartWorkflowOptions } from "./workflow.service.js";
import { JwtGuard } from "../auth/jwt.guard.js";

@Controller("workflow-executions")
@UseGuards(JwtGuard)
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  async start(@Body() body: Omit<StartWorkflowOptions, "userId">, @Req() req: Request) {
    const userId = req.auth?.userId;
    return this.workflowService.startExecution({ ...body, userId });
  }

  @Get(":executionId")
  async getStatus(@Param("executionId") executionId: string, @Req() req: Request) {
    const orgId = req.auth?.orgId ?? "";
    return this.workflowService.getStatus(executionId, orgId);
  }

  @Delete(":executionId")
  async cancel(@Param("executionId") executionId: string, @Req() req: Request) {
    const orgId = req.auth?.orgId ?? "";
    await this.workflowService.cancelExecution(executionId, orgId);
    return { success: true };
  }

  @Post(":executionId/signal/:signalName")
  async signal(
    @Param("executionId") executionId: string,
    @Param("signalName")  signalName:  string,
    @Body()               body:        unknown,
    @Req()                req:         Request,
  ) {
    const orgId = req.auth?.orgId ?? "";
    await this.workflowService.sendSignal(executionId, orgId, signalName, body);
    return { success: true };
  }
}
