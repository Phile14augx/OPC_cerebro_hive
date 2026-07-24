/**
 * forge-api — WorkflowService
 * Starts, queries, signals, and cancels Temporal workflow executions.
 */

import { Injectable, Logger } from "@nestjs/common";
import { TemporalService } from "../temporal/temporal.service.js";
import { executionRepository } from "@cerebro/db";
import { queue, SUBJECTS } from "@cerebro/queue";
import { randomUUID } from "node:crypto";

export interface StartWorkflowOptions {
  workflowId:   string;
  executionId:  string;
  orgId:        string;
  userId?:      string;
  input:        Record<string, unknown>;
  testMode?:    boolean;
}

export interface WorkflowStatus {
  executionId:        string;
  temporalWorkflowId: string | null;
  status:             string;
  startTime?:         Date;
  closeTime?:         Date;
  output?:            unknown;
  error?:             unknown;
}

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(private readonly temporal: TemporalService) {}

  async startExecution(opts: StartWorkflowOptions): Promise<WorkflowStatus> {
    const temporalId = `exec_${opts.executionId}`;

    try {
      await this.temporal.startWorkflow("cerebroWorkflow", {
        workflowId: temporalId,
        args: [{
          workflowId:  opts.workflowId,
          executionId: opts.executionId,
          orgId:       opts.orgId,
          userId:      opts.userId,
          input:       opts.input,
          testMode:    opts.testMode ?? false,
        }],
        taskQueue: this.temporal.taskQueue,
      });

      await executionRepository.update(opts.executionId, {
        status:             "RUNNING",
        temporalWorkflowId: temporalId,
      });

      await queue.publish(SUBJECTS.WORKFLOW.EXECUTION_STARTED, {
        id:          randomUUID(),
        orgId:       opts.orgId,
        workflowId:  opts.workflowId,
        executionId: opts.executionId,
        triggeredBy: opts.userId ?? "api",
        input:       opts.input,
        version:     1,
      });

      return {
        executionId:        opts.executionId,
        temporalWorkflowId: temporalId,
        status:             "RUNNING",
      };
    } catch (err) {
      this.logger.error("Failed to start Temporal workflow", { err, executionId: opts.executionId });

      await executionRepository.update(opts.executionId, {
        status:     "FAILED",
        error:      { message: err instanceof Error ? err.message : String(err) },
        completedAt: new Date(),
      });

      throw err;
    }
  }

  async getStatus(executionId: string, orgId: string): Promise<WorkflowStatus | null> {
    const execution = await executionRepository.findById(executionId, orgId);
    if (!execution) return null;

    let temporalStatus: { status: string; closeTime?: Date; output?: unknown } | null = null;
    if (execution.temporalWorkflowId) {
      try {
        temporalStatus = await this.temporal.describeWorkflow(execution.temporalWorkflowId);
      } catch {
        // Temporal not reachable — fall back to DB status
      }
    }

    return {
      executionId:        execution.id,
      temporalWorkflowId: execution.temporalWorkflowId,
      status:             temporalStatus?.status ?? execution.status,
      closeTime:          temporalStatus?.closeTime,
      output:             execution.output as unknown,
      error:              execution.error  as unknown,
    };
  }

  async cancelExecution(executionId: string, orgId: string): Promise<void> {
    const execution = await executionRepository.findById(executionId, orgId);
    if (!execution?.temporalWorkflowId) return;

    await this.temporal.cancelWorkflow(execution.temporalWorkflowId);

    await executionRepository.update(executionId, {
      status:      "CANCELLED",
      completedAt: new Date(),
    });
  }

  async sendSignal(executionId: string, orgId: string, signalName: string, payload: unknown): Promise<void> {
    const execution = await executionRepository.findById(executionId, orgId);
    if (!execution?.temporalWorkflowId) {
      throw new Error(`Execution ${executionId} has no associated Temporal workflow`);
    }

    await this.temporal.signalWorkflow(execution.temporalWorkflowId, signalName, [payload]);
  }
}
