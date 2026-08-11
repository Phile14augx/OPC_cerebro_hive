import { InMemoryKnowledgeGraph } from './adapters/InMemoryKnowledgeGraph';
import { GraphIngestionService } from './ingestion/GraphIngestionService';
import { GraphAlgorithms } from './algorithms/GraphAlgorithms';
import { ReasoningEngine } from './reasoning/ReasoningEngine';
import { GraphPlanner } from './planner/GraphPlanner';
import { GraphQueryAssistant } from './ai/GraphQueryAssistant';
import { NodeKind, RelationshipType } from './ontology/Ontology';

async function runTest() {
  console.log('--- Starting Enterprise Knowledge Graph Test ---');

  const graph = new InMemoryKnowledgeGraph();
  const ingestion = new GraphIngestionService(graph);
  const algorithms = new GraphAlgorithms(graph);
  const reasoning = new ReasoningEngine(graph, algorithms);
  const planner = new GraphPlanner(graph, algorithms);
  const aiAssistant = new GraphQueryAssistant(planner);

  // 1. Ingest nodes (Simulating Event Bus consumer)
  console.log('\n[1] Ingesting Semantic Nodes...');
  await ingestion.handleAssetRegistered('svc-checkout', NodeKind.BusinessService, { name: 'Checkout Service', labels: ['MissionCritical'] });
  await ingestion.handleAssetRegistered('ci-api-gateway', NodeKind.ConfigurationItem, { name: 'API Gateway' });
  await ingestion.handleAssetRegistered('mdl-gpt5', NodeKind.AIModel, { name: 'GPT-5', status: 'Draft' });

  // 2. Ingest edges (Dependencies)
  console.log('\n[2] Building Semantic Edges...');
  await ingestion.handleDependencyCreated('svc-checkout', 'ci-api-gateway', RelationshipType.DEPENDS_ON);
  await ingestion.handleDependencyCreated('ci-api-gateway', 'mdl-gpt5', RelationshipType.DEPENDS_ON);

  // 3. Reasoning Engine Rule Evaluation
  console.log('\n[3] Running Deterministic Reasoning Engine...');
  const result = await reasoning.evaluateMissionCriticalAI();
  console.log(`    Rule: ${result.ruleName}`);
  console.log(`    Passed: ${result.passed}`);
  if (!result.passed) {
    result.violations.forEach(v => console.log(`    Violation: ${v}`));
  }

  // 4. Natural Language AI Assistant
  console.log('\n[4] Querying AI Assistant...');
  const answer = await aiAssistant.ask('Which MissionCritical services depend on GPT-5?');
  console.log(answer);

  console.log(`\n--- Test Completed Successfully ---`);
}

runTest().catch(console.error);
