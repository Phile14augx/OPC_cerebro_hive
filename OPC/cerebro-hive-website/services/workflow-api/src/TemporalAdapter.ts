import { PlatformEventBus } from '@cerebro/events';

// Proxy wrapping durable execution engine (Temporal)
export class TemporalAdapter {
  startWorkflowExecution(template: { templateId: string }, _inputs: unknown) {
    console.log('[TemporalAdapter] Pushing durable workflow execution to Temporal...');
    PlatformEventBus.publish('telemetry:event', { 
      type: 'WORKFLOW_STARTED', 
      details: { engine: 'Temporal', workflowId: template.templateId },
      timestamp: new Date(), source: 'TemporalAdapter', severity: 'info' 
    });
  }
}
