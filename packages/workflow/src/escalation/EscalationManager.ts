/**
 * CerebroFlow — Escalation & Human-in-the-Loop Manager
 * Manages approval queues, SLA enforcement, and multi-tier escalation chains.
 * Primary AI: Claude
 */

import type { EscalationConfig, EscalationTier, ExecutionContext } from '../dsl/types.js';

export interface ApprovalTask {
  id: string;
  executionId: string;
  workflowId: string;
  nodeId: string;
  assigneeRef: string;
  title: string;
  description: string;
  createdAt: Date;
  dueAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'escalated';
  currentTier: number;
  context: Record<string, unknown>;
  decision?: {
    decidedBy: string;
    decidedAt: Date;
    outcome: 'approved' | 'rejected';
    note?: string;
  };
}

export interface NotificationPayload {
  to: string;
  channel: 'email' | 'slack' | 'sms' | 'teams';
  subject?: string;
  body: string;
  taskId: string;
  approvalUrl: string;
}

export interface EscalationManagerOptions {
  sendNotification: (payload: NotificationPayload) => Promise<void>;
  persistTask: (task: ApprovalTask) => Promise<void>;
  loadTask: (taskId: string) => Promise<ApprovalTask | null>;
  resolveAssignee: (ref: string, ctx: ExecutionContext) => Promise<string[]>;
  baseApprovalUrl: string;
}

export class EscalationManager {
  constructor(private readonly opts: EscalationManagerOptions) {}

  /** Create an approval task and notify the first-tier assignee. */
  async createApprovalTask(params: {
    executionId: string;
    workflowId: string;
    nodeId: string;
    assigneeRef: string;
    title: string;
    descriptionTemplate: string;
    timeoutHours: number;
    ctx: ExecutionContext;
  }): Promise<ApprovalTask> {
    const description = this.interpolate(params.descriptionTemplate, params.ctx);
    const dueAt = new Date(Date.now() + params.timeoutHours * 60 * 60 * 1000);

    const task: ApprovalTask = {
      id: `task_${params.executionId}_${params.nodeId}`,
      executionId: params.executionId,
      workflowId: params.workflowId,
      nodeId: params.nodeId,
      assigneeRef: params.assigneeRef,
      title: params.title,
      description,
      createdAt: new Date(),
      dueAt,
      status: 'pending',
      currentTier: 1,
      context: { ...params.ctx.variables },
    };

    await this.opts.persistTask(task);
    await this.notifyAssignees(task, params.assigneeRef, params.ctx);
    return task;
  }

  /** Record an approval decision and resume the workflow. */
  async recordDecision(
    taskId: string,
    outcome: 'approved' | 'rejected',
    decidedBy: string,
    note?: string,
  ): Promise<ApprovalTask> {
    const task = await this.opts.loadTask(taskId);
    if (!task) throw new Error(`Approval task not found: ${taskId}`);
    if (task.status !== 'pending' && task.status !== 'escalated') {
      throw new Error(`Task ${taskId} is already ${task.status}`);
    }

    task.status = outcome;
    task.decision = { decidedBy, decidedAt: new Date(), outcome, note };
    await this.opts.persistTask(task);
    return task;
  }

  /** Check SLA timers and escalate overdue tasks. */
  async processSLATimers(
    expiredTasks: ApprovalTask[],
    escalationConfig: EscalationConfig,
    ctx: ExecutionContext,
  ): Promise<void> {
    for (const task of expiredTasks) {
      const nextTier = escalationConfig.tiers.find(t => t.level === task.currentTier + 1);
      if (!nextTier) {
        // No more tiers — dead-letter the task
        task.status = 'expired';
        await this.opts.persistTask(task);
        continue;
      }

      task.currentTier = nextTier.level;
      task.status = 'escalated';
      task.dueAt = new Date(Date.now() + nextTier.sla_minutes * 60 * 1000);
      await this.opts.persistTask(task);
      await this.notifyTier(task, nextTier, ctx);

      // Always-notify list
      for (const always of escalationConfig.always_notify ?? []) {
        await this.sendEscalationNotification(task, always, 'email', nextTier, ctx);
      }
    }
  }

  /** Build an approval card payload for in-app or Slack notification. */
  buildApprovalCard(task: ApprovalTask): Record<string, unknown> {
    return {
      type: 'approval_card',
      taskId: task.id,
      title: task.title,
      description: task.description,
      dueAt: task.dueAt.toISOString(),
      tier: task.currentTier,
      actions: [
        { type: 'button', label: 'Approve', style: 'primary', action: 'approve', url: `${this.opts.baseApprovalUrl}/approve/${task.id}` },
        { type: 'button', label: 'Reject', style: 'danger', action: 'reject', url: `${this.opts.baseApprovalUrl}/reject/${task.id}` },
        { type: 'button', label: 'View Details', style: 'secondary', url: `${this.opts.baseApprovalUrl}/task/${task.id}` },
      ],
    };
  }

  private async notifyAssignees(task: ApprovalTask, assigneeRef: string, ctx: ExecutionContext) {
    const emails = await this.opts.resolveAssignee(assigneeRef, ctx);
    for (const email of emails) {
      await this.opts.sendNotification({
        to: email,
        channel: 'email',
        subject: `Action Required: ${task.title}`,
        body: this.buildEmailBody(task),
        taskId: task.id,
        approvalUrl: `${this.opts.baseApprovalUrl}/task/${task.id}`,
      });
    }
  }

  private async notifyTier(task: ApprovalTask, tier: EscalationTier, ctx: ExecutionContext) {
    for (const channel of tier.notification_channels) {
      await this.sendEscalationNotification(task, tier.assignee_ref, channel, tier, ctx);
    }
  }

  private async sendEscalationNotification(
    task: ApprovalTask,
    assigneeRef: string,
    channel: 'email' | 'slack' | 'sms' | 'teams',
    tier: EscalationTier,
    ctx: ExecutionContext,
  ) {
    const recipients = await this.opts.resolveAssignee(assigneeRef, ctx);
    const body = this.interpolate(tier.message_template, ctx);
    for (const recipient of recipients) {
      await this.opts.sendNotification({
        to: recipient, channel, body,
        subject: `[Escalated L${tier.level}] ${task.title}`,
        taskId: task.id,
        approvalUrl: `${this.opts.baseApprovalUrl}/task/${task.id}`,
      });
    }
  }

  private buildEmailBody(task: ApprovalTask): string {
    return [
      `Hello,`,
      ``,
      `An action requires your attention:`,
      ``,
      `**${task.title}**`,
      task.description,
      ``,
      `Due by: ${task.dueAt.toLocaleString()}`,
      ``,
      `Please review and respond here:`,
      `${this.opts.baseApprovalUrl}/task/${task.id}`,
      ``,
      `— CerebroFlow Automation`,
    ].join('\n');
  }

  private interpolate(template: string, ctx: ExecutionContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
      const keys = key.trim().split('.');
      let val: unknown = ctx.variables;
      for (const k of keys) {
        if (val == null || typeof val !== 'object') return '';
        val = (val as Record<string, unknown>)[k];
      }
      return val != null ? String(val) : '';
    });
  }
}
