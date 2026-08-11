/**
 * forge-api — TemporalService
 * Wraps @temporalio/client for workflow management.
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { Connection, Client, type WorkflowHandle } from "@temporalio/client";
import { getForgeApiConfig } from "@cerebro/config";

@Injectable()
export class TemporalService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TemporalService.name);
  private connection: Connection | null = null;
  private client:     Client     | null = null;

  readonly taskQueue: string;

  constructor() {
    const cfg = getForgeApiConfig();
    this.taskQueue = cfg.TEMPORAL_TASK_QUEUE;
  }

  async onModuleInit(): Promise<void> {
    const cfg = getForgeApiConfig();
    try {
      this.connection = await Connection.connect({ address: cfg.TEMPORAL_ADDRESS });
      this.client     = new Client({
        connection: this.connection,
        namespace:  cfg.TEMPORAL_NAMESPACE,
      });
      this.logger.log(`Connected to Temporal at ${cfg.TEMPORAL_ADDRESS}`);
    } catch (err) {
      this.logger.warn("Could not connect to Temporal (will retry on demand):", err);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.connection?.close();
  }

  private getClient(): Client {
    if (!this.client) throw new Error("Temporal client not initialized");
    return this.client;
  }

  async startWorkflow(
    workflowType: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opts: Record<string, any>,
  ): Promise<WorkflowHandle> {
    return this.getClient().workflow.start(workflowType as never, {
      ...opts,
      taskQueue: opts["taskQueue"] ?? this.taskQueue,
    } as never);
  }

  async describeWorkflow(workflowId: string): Promise<{
    status:     string;
    closeTime?: Date;
  }> {
    const handle = this.getClient().workflow.getHandle(workflowId);
    const desc   = await handle.describe();
    return {
      status:    desc.status.name,
      closeTime: desc.closeTime ?? undefined,
    };
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    const handle = this.getClient().workflow.getHandle(workflowId);
    await handle.cancel();
  }

  async terminateWorkflow(workflowId: string, reason?: string): Promise<void> {
    const handle = this.getClient().workflow.getHandle(workflowId);
    await handle.terminate(reason);
  }

  async signalWorkflow(workflowId: string, signalName: string, args: unknown[]): Promise<void> {
    const handle = this.getClient().workflow.getHandle(workflowId);
    await handle.signal(signalName as never, ...args);
  }

  async queryWorkflow<T>(workflowId: string, queryName: string): Promise<T> {
    const handle = this.getClient().workflow.getHandle(workflowId);
    return handle.query<T>(queryName as never);
  }
}
