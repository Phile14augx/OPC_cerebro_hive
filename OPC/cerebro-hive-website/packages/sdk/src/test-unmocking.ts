import { AgentClient } from './clients/AgentClient';
import { WorkflowClient } from './clients/WorkflowClient';
import { TelemetryClient } from './clients/TelemetryClient';

async function main() {
  console.log('--- Phase 9: Unmocking SDK Test ---');

  const headers = { 'x-workspace-id': 'default-workspace' };
  const baseUrl = 'http://localhost:3000';

  const agentClient = new AgentClient(baseUrl, headers);
  const workflowClient = new WorkflowClient(baseUrl, headers);
  const telemetryClient = new TelemetryClient(baseUrl, headers);

  try {
    console.log('\n[1] Testing AgentClient (Fetching Real Data from PostgreSQL)...');
    const agents = await agentClient.listAgents({ limit: 5 });
    console.log(`Found ${agents.data.length} agents in DB.`);
    
    if (agents.data.length > 0) {
      const agentDetails = await agentClient.getAgent(agents.data[0].id);
      console.log(`Fetched details for agent: ${agentDetails?.name}`);
    }

    console.log('\n[2] Testing WorkflowClient (Fetching Real Data from PostgreSQL)...');
    const workflows = await workflowClient.listWorkflows();
    console.log(`Found ${workflows.data.length} workflows in DB.`);

    if (workflows.data.length > 0) {
      console.log(`Executing workflow: ${workflows.data[0].name}`);
      const exec = await workflowClient.executeWorkflow(workflows.data[0].id);
      console.log(`Execution created: ${exec.executionId} (Status: ${exec.status})`);
    }

    console.log('\n[3] Testing TelemetryClient (Mapping Real Executions to Traces)...');
    const overview = await telemetryClient.getOverview();
    console.log(`Telemetry Overview: ${overview.rpm} RPM, ${overview.avgLatencyMs}ms latency`);
    
    const traces = await telemetryClient.listTraces();
    console.log(`Found ${traces.length} recent pseudo-traces from AgentExecutions.`);

    if (traces.length > 0) {
      const traceDetails = await telemetryClient.getTraceDetails(traces[0].id);
      console.log(`Fetched details for trace ${traceDetails.summary.traceId}, contains ${traceDetails.spans.length} spans.`);
    }

    console.log('\n--- Test Completed successfully! SDK is fully wired. ---');
  } catch (error: any) {
    console.error('\nAPI Request Failed:', error.message);
    if (error.problem) console.error('Problem Details:', error.problem);
  }
}

main();
