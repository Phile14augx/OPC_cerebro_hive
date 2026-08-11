import { InMemoryKnowledgeGraph, GraphIngestionService, NodeKind } from '../../knowledge-graph-core/src/index';
import { EvidenceGraphEngine, BatchLearningEngine, ExecutionRecord, ExecutionStatus, OperationalMetricsProvider } from './index';

async function runTest() {
  console.log('--- Starting Enterprise Operational Memory Test ---');

  // 1. Establish the Canonical Knowledge Graph
  console.log('\n[1] Building Canonical Production Graph...');
  const canonicalGraph = new InMemoryKnowledgeGraph();
  const ingestion = new GraphIngestionService(canonicalGraph);
  
  await ingestion.handleAssetRegistered('svc-chatbot', NodeKind.BusinessService, { name: 'Support Chatbot' });

  // 2. Initialize Operational Memory Engines
  const evidenceEngine = new EvidenceGraphEngine(canonicalGraph);
  const batchEngine = new BatchLearningEngine(evidenceEngine);
  const metricsAPI = new OperationalMetricsProvider(evidenceEngine, batchEngine);

  // 3. Simulate Ingestion of 100 Historical Execution Records
  console.log('\n[2] Ingesting 100 Historical Execution Records into Evidence Graph...');
  
  const runbookId = 'rb-failover-anthropic';

  for (let i = 0; i < 100; i++) {
    // 80% Success, 10% Manual Override, 10% Rollback
    let status = ExecutionStatus.SUCCESS;
    if (i >= 80 && i < 90) status = ExecutionStatus.MANUAL_OVERRIDE;
    if (i >= 90) status = ExecutionStatus.ROLLED_BACK;

    const record: ExecutionRecord = {
      recordId: `exec-${i}`,
      incidentId: `inc-${Math.floor(Math.random() * 1000)}`,
      runbookId,
      targetNodeId: 'svc-chatbot',
      status,
      durationMs: status === ExecutionStatus.SUCCESS ? 4000 : 8000, // Faster on success
      confidenceAtExecution: 0.9,
      timestamp: new Date()
    };

    await evidenceEngine.ingestExecution(record);
  }

  // 4. Verify Batch Learning
  console.log('\n[3] Running Batch Learning Engine to Recalculate Confidence Vector...');
  const vector = metricsAPI.getRunbookConfidence(runbookId);

  console.log(`\n📊 Runbook Confidence Vector: [${runbookId}]`);
  console.log(`   - Reliability:   ${(vector.reliability * 100).toFixed(1)}% (Target ~80%)`);
  console.log(`   - Safety:        ${(vector.safety * 100).toFixed(1)}% (Target ~90%)`);
  console.log(`   - Operator Trust:${(vector.operatorTrust * 100).toFixed(1)}% (Target ~90%)`);
  console.log(`   - Speed:         ${(vector.speed * 100).toFixed(1)}%`);
  console.log(`   - Composite:     ${(vector.compositeScore * 100).toFixed(1)}%`);

  // 5. Verify Canonical Reference
  console.log('\n[4] Verifying Canonical Graph References...');
  // A node should have 100 HAS_EXECUTION edges pointing to Event nodes
  const executionEdges = await canonicalGraph.getOutgoingEdges('svc-chatbot', 'HAS_EXECUTION');
  console.log(`    Total Execution Events for 'svc-chatbot': ${executionEdges.length}`);

  console.log(`\n--- Test Completed Successfully ---`);
}

runTest().catch(console.error);
