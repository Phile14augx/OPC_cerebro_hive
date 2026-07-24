/**
 * forge-api — WorkflowModule
 * Handles workflow execution orchestration via Temporal.
 */

import { Module } from "@nestjs/common";
import { WorkflowController } from "./workflow.controller.js";
import { WorkflowService }    from "./workflow.service.js";
import { TemporalModule }     from "../temporal/temporal.module.js";

@Module({
  imports:     [TemporalModule],
  controllers: [WorkflowController],
  providers:   [WorkflowService],
  exports:     [WorkflowService],
})
export class WorkflowModule {}
