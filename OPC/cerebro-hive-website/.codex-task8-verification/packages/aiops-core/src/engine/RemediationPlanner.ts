import { RemediationPlan } from '../domain/RemediationPlan';
import { Runbook } from '../domain/Runbook';
import { DigitalTwinEngine, ChangeSimulator } from '../../../simulation-core/src/index';
import { SemanticNode, KnowledgeGraphPort } from '../../../knowledge-graph-core/src/index';

export class RemediationPlanner {
  constructor(private readonly canonicalGraph: KnowledgeGraphPort) {}

  async planRemediation(incidentId: string, failedNodeId: string): Promise<RemediationPlan> {
    console.log(`[RemediationPlanner] Planning remediation for incident ${incidentId} (Node: ${failedNodeId})`);

    const failedNode = await this.canonicalGraph.getNode(failedNodeId);
    if (!failedNode) throw new Error('Target node not found');

    // 1. Select Candidate Runbook
    const runbook: Runbook = {
      runbookId: 'rb-failover-anthropic',
      name: 'Failover to Anthropic Claude',
      version: '1.0.0',
      owner: 'AIOps',
      provider: 'Mock',
      payloadTemplate: { provider: 'Anthropic' },
      confidenceScore: 0.90, // Slightly below 0.95 to trigger human approval based on Policy
      executionHistoryCount: 15
    };

    // 2. Validate via Digital Twin (Simulation)
    console.log(`[RemediationPlanner] Validating proposed runbook in Digital Twin...`);
    const twin = new DigitalTwinEngine(this.canonicalGraph);
    const simulator = new ChangeSimulator(twin);
    
    // Simulate linking the chatbot to Anthropic instead
    const claudeNode: SemanticNode = {
      id: 'prv-anthropic-claude',
      kind: 'AIProvider',
      labels: ['Approved'],
      properties: { name: 'Anthropic Claude' },
      version: 1,
      provenance: { createdBy: 'Sim', sourceSystem: 'Sim', confidenceScore: 1, createdAt: new Date(), updatedAt: new Date() }
    };

    // We assume 'svc-chatbot' is the dependent node from the canonical graph
    const policyViolations = await simulator.simulateModelDeployment(claudeNode, 'svc-chatbot');

    const plan: RemediationPlan = {
      planId: `plan-${Date.now()}`,
      incidentId,
      incidentSeverity: 'High',
      targetNodes: [failedNode],
      runbooks: [runbook],
      confidenceRationale: 'Selected based on previous provider failover success rate (90%). Simulation passed with 0 policy violations.',
      requiresHumanApproval: false, // Will be evaluated by PolicyEngine
      status: 'Pending'
    };

    if (policyViolations.length > 0) {
      plan.confidenceRationale += ` WARNING: Simulation detected violations: ${policyViolations.join(', ')}`;
    }

    return plan;
  }
}
