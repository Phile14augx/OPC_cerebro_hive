import { CerebroKernel } from './index';
import { DomainEvent } from '@cerebro/core-bus';

async function runIntegrationTest() {
  console.log('--- Starting Kernel Integration Test ---');
  const kernel = new CerebroKernel();
  
  // 1. Boot the OS Kernel
  await kernel.bootstrap();

  // 2. Subscribe to an event on the memory bus
  kernel.eventBus.subscribe('WorkflowStarted', async (event: DomainEvent) => {
    console.log(`[Trust Module] Intercepted WorkflowStarted event from ${event.source}`);
    console.log(`[Trust Module] Validating payload:`, event.payload);
  });

  kernel.eventBus.subscribe('WorkflowStarted', async (event: DomainEvent) => {
    console.log(`[Analytics] Intercepted WorkflowStarted event. Updating metrics for tenant ${event.tenantId}.`);
  });

  // 3. Emit a domain event simulating the Workflow Engine
  console.log('\n[Workflow Engine] Emitting WorkflowStarted event...');
  await kernel.eventBus.publish({
    eventId: 'evt-1234',
    eventType: 'WorkflowStarted',
    aggregateId: 'wf-5678',
    aggregateType: 'Workflow',
    tenantId: 'tenant-xyz',
    timestamp: new Date(),
    version: 1,
    actor: { id: 'user-abc', type: 'Human' },
    source: 'capability:workflow-runner',
    payload: {
      workflowName: 'Customer Support Triage',
      priority: 'high'
    }
  });

  console.log('\n--- Shutting Down ---');
  await kernel.shutdown();
}

runIntegrationTest().catch(console.error);
