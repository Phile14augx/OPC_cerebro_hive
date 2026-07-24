import { InMemoryKnowledgeGraph, GraphIngestionService, NodeKind } from '../../knowledge-graph-core/src/index';
import { 
  DecisionContext, 
  DecisionScenario, 
  PortfolioSimulator, 
  OptimizationEngine, 
  ScenarioComparator, 
  ExecutiveCopilot 
} from './index';

async function runTest() {
  console.log('--- Starting Enterprise Decision Intelligence Test ---');

  // 1. Establish the Canonical (Production) Knowledge Graph
  console.log('\n[1] Building Canonical Production Graph (Current State)...');
  const canonicalGraph = new InMemoryKnowledgeGraph();
  const ingestion = new GraphIngestionService(canonicalGraph);
  
  await ingestion.handleAssetRegistered('svc-chatbot', NodeKind.BusinessService, { name: 'Support Chatbot' });
  await ingestion.handleAssetRegistered('mdl-support-gpt', NodeKind.AIModel, { name: 'Support GPT' });
  await ingestion.handleAssetRegistered('prv-azure-openai', NodeKind.AIProvider, { name: 'Azure OpenAI' });
  // Pretend they are linked in canonical...

  // 2. Define the Strategic Context
  const context: DecisionContext = {
    contextId: 'ctx-q3-strategy',
    objectives: {
      maximize: ['Compliance', 'Availability'],
      minimize: ['Cost', 'BlastRadius']
    },
    // We heavily weight Compliance and Availability over Cost
    weights: {
      Availability: 0.8,
      Compliance: 1.0,
      Performance: 0.5,
      Cost: 0.4, 
      RecoveryTime: 0.3,
      BlastRadius: 0.6
    }
  };

  // 3. Define the Scenarios
  const scenarioA: DecisionScenario = {
    scenarioId: 'sc-cloud-only',
    decisionId: 'dec-ai-arch',
    name: 'Option A: Cloud API Only (Anthropic)',
    description: 'Migrate to Anthropic Claude via public API.',
    proposedInjections: [
      { id: 'prv-anthropic', kind: 'AIProvider', labels: [], properties: { name: 'Anthropic Cloud' }, version: 1, provenance: { createdBy:'sim', sourceSystem:'sim', confidenceScore:1, createdAt: new Date(), updatedAt: new Date() } }
    ],
    proposedDependencies: [],
    proposedSeverances: []
  };

  const scenarioB: DecisionScenario = {
    scenarioId: 'sc-hybrid-local',
    decisionId: 'dec-ai-arch',
    name: 'Option B: Hybrid Local (Llama 3)',
    description: 'Deploy Llama 3 locally for PII-heavy workloads.',
    proposedInjections: [
      { id: 'prv-local-llama', kind: 'AIProvider', labels: ['Local'], properties: { name: 'Local Llama 3' }, version: 1, provenance: { createdBy:'sim', sourceSystem:'sim', confidenceScore:1, createdAt: new Date(), updatedAt: new Date() } }
    ],
    proposedDependencies: [],
    proposedSeverances: []
  };

  // 4. Initialize Engines
  const simulator = new PortfolioSimulator(canonicalGraph);
  const optimizer = new OptimizationEngine(context);
  const comparator = new ScenarioComparator(simulator, optimizer);

  // 5. Run Comparator
  const rankedScenarios = await comparator.evaluateOptions([scenarioA, scenarioB]);

  // 6. Copilot Summary
  const copilot = new ExecutiveCopilot();
  console.log(copilot.summarizeRecommendation(context, rankedScenarios));

  console.log(`\n--- Test Completed Successfully ---`);
}

runTest().catch(console.error);
