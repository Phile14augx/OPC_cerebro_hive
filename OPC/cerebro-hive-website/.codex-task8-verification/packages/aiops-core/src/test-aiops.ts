import { InMemoryKnowledgeGraph, GraphIngestionService, NodeKind, RelationshipType } from '../../knowledge-graph-core/src/index';
import { RemediationPlanner, ExecutionEngine, ClosedLoopVerifier, AIOpsOrchestrator, MockRunbookProvider, MissionCriticalApprovalPolicy, OperationalCopilot } from './index';

async function runTest() {
  console.log('--- Starting Autonomous Operations (AIOps) Test ---');

  // 1. Establish the Canonical (Production) Knowledge Graph
  console.log('\n[0] Building Canonical Production Graph...');
  const canonicalGraph = new InMemoryKnowledgeGraph();
  const ingestion = new GraphIngestionService(canonicalGraph);
  
  // Ingest assets (Simulating the state from the Incident context)
  await ingestion.handleAssetRegistered('cap-support', NodeKind.BusinessCapability, { name: 'Customer Support', labels: ['MissionCritical'] });
  await ingestion.handleAssetRegistered('svc-chatbot', NodeKind.BusinessService, { name: 'Support Chatbot' });
  await ingestion.handleAssetRegistered('mdl-support-gpt', NodeKind.AIModel, { name: 'Support GPT' });
  await ingestion.handleAssetRegistered('prv-azure-openai', NodeKind.AIProvider, { name: 'Azure OpenAI' });

  // Ingest relationships
  await ingestion.handleDependencyCreated('cap-support', 'svc-chatbot', RelationshipType.DEPENDS_ON);
  await ingestion.handleDependencyCreated('svc-chatbot', 'mdl-support-gpt', RelationshipType.DEPENDS_ON);
  await ingestion.handleDependencyCreated('mdl-support-gpt', 'prv-azure-openai', RelationshipType.DEPENDS_ON);

  // 2. Setup AIOps Engines
  const planner = new RemediationPlanner(canonicalGraph);
  const verifier = new ClosedLoopVerifier();
  const provider = new MockRunbookProvider();
  const executionEngine = new ExecutionEngine([provider], verifier);
  const policies = [new MissionCriticalApprovalPolicy()];
  
  const orchestrator = new AIOpsOrchestrator(planner, executionEngine, policies);

  // 3. Trigger the Incident Flow
  console.log('\n[1] Simulating Incident Trigger...');
  const incidentId = 'inc-9921';
  const failedNodeId = 'prv-azure-openai';

  await orchestrator.handleIncident(incidentId, failedNodeId);

  // 4. Copilot Explanation
  console.log('\n[2] Copilot Explanation...');
  const copilot = new OperationalCopilot();
  // We can recreate the plan for the explanation, or just run the planner again for the log
  const plan = await planner.planRemediation(incidentId, failedNodeId);
  // Force evaluation for accurate explanation
  plan.requiresHumanApproval = policies[0].evaluate(plan);
  console.log(copilot.explainPlan(plan));

  console.log(`\n--- Test Completed Successfully ---`);
}

runTest().catch(console.error);
