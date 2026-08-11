import { AIGovernanceService } from './services/AIGovernanceService';
import { AIRegistry } from './registry/AIRegistry';
import { MockAssetProvider, MockChangeProvider, MockPolicyProvider } from './integrations/Providers';
import { AIModel, ModelStatus } from './domain/AIModel';
import { AIEvaluation } from './domain/AIEvaluation';

async function runTest() {
  console.log('--- Starting AI Governance Lifecycle Test ---');

  const registry = new AIRegistry();
  const assetProvider = new MockAssetProvider();
  const changeProvider = new MockChangeProvider();
  const policyProvider = new MockPolicyProvider();
  
  const aiGovService = new AIGovernanceService(registry, assetProvider, changeProvider, policyProvider);

  // 1. Register a new Model
  const model: AIModel = {
    modelId: 'mdl-customer-support-v1',
    name: 'Customer Support LLM',
    version: '1.0.0',
    cmdbConfigurationItemId: '', // Will be populated by service
    providerId: 'prv-openai-01',
    supportedModalities: ['text'],
    contextWindow: 128000,
    costProfile: 'Medium',
    latencyProfile: 'Fast',
    safetyProfile: 'Strict',
    status: ModelStatus.Draft,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log(`\n[1] Registering Model: ${model.name}`);
  await aiGovService.registerModel(model);
  console.log(`    CMDB Link Established: ${model.cmdbConfigurationItemId}`);

  // 2. Perform Evaluation
  const evalRecord: AIEvaluation = {
    evaluationId: 'eval-9912',
    modelId: model.modelId,
    datasetId: 'ds-support-history-cleaned',
    metrics: {
      correctnessScore: 0.95,
      hallucinationScore: 0.02,
      toxicityScore: 0.001,
      averageLatencyMs: 450
    },
    evaluatorId: 'sys-eval-pipeline',
    evaluatedAt: new Date(),
    passed: true
  };

  console.log(`\n[2] Evaluating Model...`);
  await aiGovService.evaluateModel(evalRecord);
  
  // 3. Generate Model Card
  console.log(`\n[3] Generating Model Card...`);
  const modelCard = await aiGovService.generateModelCard(model.modelId);
  console.log(`    Model Card Generated: ${modelCard.modelCardId}`);
  console.log(`    Evaluation Summary: ${modelCard.evaluationSummary}`);

  // 4. Request Deployment (Change Request via Mock)
  console.log(`\n[4] Requesting Deployment Change...`);
  const changeId = await aiGovService.requestDeployment(model.modelId);
  console.log(`    Deployment Policy Validated.`);
  console.log(`    Change Request Created: ${changeId}`);
  console.log(`    Final Model Status: ${model.status}`);

  console.log(`\n--- Test Completed Successfully ---`);
}

runTest().catch(console.error);
