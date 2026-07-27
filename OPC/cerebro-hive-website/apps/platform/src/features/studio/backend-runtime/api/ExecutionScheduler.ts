
export type TriggerType = 'API' | 'Cron' | 'Event' | 'Webhook' | 'ParentWorkflow';

export interface ExecutionTrigger {
  type: TriggerType;
  payload: Record<string, any>;
  tenantId: string;
}

export class ExecutionScheduler {
  // Routes triggers to the Gateway
  static async onTrigger(trigger: ExecutionTrigger) {
    // Determine target execution time, throttling, etc.
    console.log(`[Scheduler] Received ${trigger.type} trigger. Queuing for Gateway.`);
  }
}
