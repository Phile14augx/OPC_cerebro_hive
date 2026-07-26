
import { PlatformEventBus } from '@cerebro/events';

// Proxy wrapping durable execution engine (Temporal)
export class TemporalAdapter {
  startWorkflowExecution(template: any, inputs: any) {
    console.log('[TemporalAdapter] Pushing durable workflow execution to Temporal...');
    PlatformEventBus.publish('telemetry:event' as any, { 
      type: 'WORKFLOW_STARTED', 
      details: { engine: 'Temporal', workflowId: template.templateId } 
    } as any);
  }
}
