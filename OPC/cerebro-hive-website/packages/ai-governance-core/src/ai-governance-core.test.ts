import { describe, expect, it } from 'vitest';

import { AIEvaluation } from './domain/AIEvaluation';
import { AIModel, ModelStatus } from './domain/AIModel';
import { MockAssetProvider, MockChangeProvider, MockPolicyProvider } from './integrations/Providers';
import { AIRegistry } from './registry/AIRegistry';
import { AIGovernanceService } from './services/AIGovernanceService';

describe('AIGovernanceService', () => {
  it('only creates a deployment change after a registered model passes evaluation and policy', async () => {
    const registry = new AIRegistry();
    const service = new AIGovernanceService(
      registry,
      new MockAssetProvider(),
      new MockChangeProvider(),
      new MockPolicyProvider(),
    );
    const model: AIModel = {
      modelId: 'support-model',
      name: 'Support Model',
      version: '1.0.0',
      cmdbConfigurationItemId: '',
      providerId: 'provider-1',
      supportedModalities: ['text'],
      contextWindow: 8192,
      costProfile: 'Medium',
      latencyProfile: 'Fast',
      safetyProfile: 'Strict',
      status: ModelStatus.Draft,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };

    await service.registerModel(model);
    expect(model.cmdbConfigurationItemId).toBe('ci-aimodel-support-model');
    expect(model.status).toBe(ModelStatus.Draft);

    const evaluation: AIEvaluation = {
      evaluationId: 'evaluation-1',
      modelId: model.modelId,
      datasetId: 'dataset-1',
      metrics: { correctnessScore: 0.95, hallucinationScore: 0.01, toxicityScore: 0, averageLatencyMs: 100 },
      evaluatorId: 'evaluator',
      evaluatedAt: new Date('2026-01-02T00:00:00Z'),
      passed: true,
    };
    await service.evaluateModel(evaluation);
    expect(model.status).toBe(ModelStatus.InEvaluation);

    const changeId = await service.requestDeployment(model.modelId);
    expect(changeId).toMatch(/^CHG-\d+$/);
    expect(model.status).toBe(ModelStatus.Approved);
  });
});
