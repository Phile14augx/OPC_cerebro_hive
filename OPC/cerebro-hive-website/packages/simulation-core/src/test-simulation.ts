import { InMemoryKnowledgeGraph, GraphIngestionService, NodeKind, RelationshipType } from '../../knowledge-graph-core/src/index';
import { SimulationAnalyst } from './ai/SimulationAnalyst';

async function runTest() {
  console.log('--- Starting Enterprise Digital Twin Simulation Test ---');

  // 1. Establish the Canonical (Production) Knowledge Graph
  console.log('\n[1] Building Canonical Production Graph...');
  const canonicalGraph = new InMemoryKnowledgeGraph();
  const ingestion = new GraphIngestionService(canonicalGraph);
  
  // Ingest assets
  await ingestion.handleAssetRegistered('cap-support', NodeKind.BusinessCapability, { name: 'Customer Support' });
  await ingestion.handleAssetRegistered('svc-chatbot', NodeKind.BusinessService, { name: 'Support Chatbot' });
  await ingestion.handleAssetRegistered('mdl-support-gpt', NodeKind.AIModel, { name: 'Support GPT' });
  await ingestion.handleAssetRegistered('prv-azure-openai', NodeKind.AIProvider, { name: 'Azure OpenAI' });

  // Ingest relationships
  await ingestion.handleDependencyCreated('cap-support', 'svc-chatbot', RelationshipType.DEPENDS_ON);
  await ingestion.handleDependencyCreated('svc-chatbot', 'mdl-support-gpt', RelationshipType.DEPENDS_ON);
  await ingestion.handleDependencyCreated('mdl-support-gpt', 'prv-azure-openai', RelationshipType.DEPENDS_ON);

  // 2. Query the Analyst
  console.log('\n[2] Executing Simulation Analyst...');
  const analyst = new SimulationAnalyst(canonicalGraph);
  const summary = await analyst.ask('What happens if Azure OpenAI becomes unavailable?');
  
  console.log('\n' + summary);

  // 3. Verify Canonical Graph remains untouched
  console.log('\n[3] Verifying Canonical Graph Integrity...');
  const provider = await canonicalGraph.getNode('prv-azure-openai');
  console.log(`    Canonical Graph Provider exists? ${!!provider}`);
  if (provider) {
    console.log(`    Provider Name: ${provider.properties.name}`);
  }

  console.log(`\n--- Test Completed Successfully ---`);
}

runTest().catch(console.error);
