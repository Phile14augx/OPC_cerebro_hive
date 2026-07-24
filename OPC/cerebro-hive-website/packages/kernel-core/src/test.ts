import { CerebroKernel } from './index';
import { DomainEvent } from '@cerebro/core-bus';
import { IdentityContext, HumanPrincipal, RobotPrincipal } from '@cerebro/identity-core';

async function runIntegrationTest() {
  console.log('--- Starting Kernel Integration Test ---');
  const kernel = new CerebroKernel();
  
  // 1. Boot the OS Kernel
  await kernel.bootstrap();

  // 2. Subscribe to an event on the memory bus
  kernel.eventBus.subscribe('WorkflowStarted', async (event: DomainEvent) => {
    console.log(`[Trust Module] Intercepted WorkflowStarted event from ${event.source}`);
    console.log(`[Trust Module] Validating Identity Context:`);
    console.log(`  - Original Principal: ${event.identity.originalPrincipal.id} (${event.identity.originalPrincipal.type})`);
    console.log(`  - Current Principal: ${event.identity.currentPrincipal.id} (${event.identity.currentPrincipal.type})`);
    console.log(`  - Delegation Depth: ${event.identity.delegationChain.length}`);
    console.log(`  - Tenancy: Org ${event.identity.tenancy.organizationId}, Workspace ${event.identity.tenancy.workspaceId}`);
  });

  // 3. Construct the Identity Context simulating a Delegation Chain
  const human: HumanPrincipal = {
    id: 'user-abc',
    type: 'Human',
    status: 'Active',
    displayName: 'Elena Rodriguez',
    issuer: 'cerebro-auth',
    authenticationSource: 'sso',
    email: 'elena@cerebrohive.com',
    metadata: {}
  };

  const robot: RobotPrincipal = {
    id: 'agent-99',
    type: 'Robot',
    status: 'Active',
    displayName: 'Customer Triage Agent',
    issuer: 'cerebro-agent-runtime',
    authenticationSource: 'internal-token',
    agentId: 'agent-99',
    metadata: {}
  };

  const identityContext: IdentityContext = {
    originalPrincipal: human,
    currentPrincipal: robot,
    delegationChain: [
      {
        principal: human,
        reason: 'User explicitly triggered agent run',
        timestamp: new Date()
      }
    ],
    tenancy: {
      organizationId: 'org-1',
      workspaceId: 'ws-100'
    },
    authenticationMethod: 'internal-token',
    correlationId: 'corr-xyz'
  };

  // 4. Emit a domain event simulating the Workflow Engine acting as the Robot
  console.log('\n[Workflow Engine] Emitting WorkflowStarted event on behalf of Robot...');
  await kernel.eventBus.publish({
    eventId: 'evt-1234',
    eventType: 'WorkflowStarted',
    aggregateId: 'wf-5678',
    aggregateType: 'Workflow',
    timestamp: new Date(),
    version: 1,
    source: 'capability:workflow-runner',
    identity: identityContext,
    payload: {
      workflowName: 'Customer Support Triage',
      priority: 'high'
    }
  });

  console.log('\n--- Shutting Down ---');
  await kernel.shutdown();
}

runIntegrationTest().catch(console.error);
