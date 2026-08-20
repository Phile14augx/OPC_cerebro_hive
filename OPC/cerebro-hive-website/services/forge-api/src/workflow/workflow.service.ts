import { Injectable, Logger } from "@nestjs/common";
import { TemporalService } from "../temporal/temporal.service.js";
import { prisma } from "@cerebro/db";
import { connect, StringCodec } from "nats";
import { randomUUID } from "node:crypto";

/** Fire-and-forget NATS publish — never throws */
async function natsPublish(subject: string, payload: unknown): Promise<void> {
  try {
    const nc = await connect({ servers: process.env["NATS_URL"] ?? "nats://localhost:4222" });
    const sc = StringCodec();
    nc.publish(subject, sc.encode(JSON.stringify(payload)));
    await nc.flush();
    await nc.close();
  } catch {
    // Non-critical: event bus may be unavailable
  }
}


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

      await prisma.workflowExecution.update({
        where: { id: opts.executionId },
        data: { status: "RUNNING" }
      });

      void natsPublish("cerebro.workflow.execution.started", {
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

      await prisma.workflowExecution.update({
        where: { id: opts.executionId },
        data: {
          status:     "FAILED",
          error:      { message: err instanceof Error ? err.message : String(err) },
          completedAt: new Date(),
        }
      });

      throw err;
    }
  }

  async getStatus(executionId: string, _orgId: string): Promise<WorkflowStatus | null> {
    const execution = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
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

  async cancelExecution(executionId: string, _orgId: string): Promise<void> {
    const execution = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
    if (!execution?.temporalWorkflowId) return;

    await this.temporal.cancelWorkflow(execution.temporalWorkflowId);

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status:      "CANCELLED",
        completedAt: new Date(),
      }
    });
  }

  async sendSignal(executionId: string, _orgId: string, signalName: string, payload: unknown): Promise<void> {
    const execution = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
    if (!execution?.temporalWorkflowId) {
      throw new Error(`Execution ${executionId} has no associated Temporal workflow`);
    }

    await this.temporal.signalWorkflow(execution.temporalWorkflowId, signalName, [payload]);
  }
}
