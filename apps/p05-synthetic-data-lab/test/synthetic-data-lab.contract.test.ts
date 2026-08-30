import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GenerationService } from '../src/generation/generation.service';
import { GenerationController } from '../src/generation/generation.controller';
import { PrivacyValidator } from '../src/privacy/privacy.validator';
import { IFederationEngine } from '../../p01-data-fabric/src/federation/engines/federation.interface';
import { FeatureStoreService } from '../../p02-feature-intelligence/src/feature-store/feature-store.service';
import { ExecutionContext } from '../../../packages/runtime-core/src/context/ExecutionContext';

test('generation service uses P01 and P02 to generate synthetic dataset with zero-trust checks', async () => {
  const mockFederationEngine: IFederationEngine = {
    query: async (sql) => {
      if (sql.includes('users')) {
        return [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
      }
      return [];
    }
  };

  const mockFeatureStore = new FeatureStoreService();
  const privacyValidator = new PrivacyValidator();
  
  const service = new GenerationService(mockFederationEngine, mockFeatureStore, privacyValidator);
  const inputSchema = { columns: ['id', 'age', 'salary'] };
  
  const context = new ExecutionContext({
    executionId: 'exec-1',
    workspaceId: 'ws-1',
    tenantId: 'tenant-123',
    userId: 'user-1',
    variables: {},
    secretRefs: {},
    policies: ['isolated-tenant']
  });

  const job = await service.triggerGeneration(
    {
      id: 'gen-1',
      type: 'tabular',
      schema: inputSchema,
      targetRows: 100,
      sourceQuery: 'SELECT * FROM users',
      featureService: 'user_features'
    },
    context
  );

  assert.equal(job.id, 'gen-1');
  assert.equal(job.status, 'completed');
  assert.equal(job.result.rows, 100);
  assert.deepEqual(job.result.schema, inputSchema);
  assert.equal(job.result.tenantId, 'tenant-123');
  assert.equal(job.result.usedFeatures.length, 2);
  assert.equal(job.result.baselineDataCount, 2);
  assert.equal(job.result.privacyCompliant, true); // Added privacy check
});

test('generation service fails if privacy evaluation fails', async () => {
  const mockFederationEngine: IFederationEngine = { query: async () => [] };
  const mockFeatureStore = new FeatureStoreService();
  const privacyValidator = new PrivacyValidator();
  
  // Mock evaluate to fail
  const originalEvaluate = privacyValidator.evaluate;
  privacyValidator.evaluate = () => ({ compliant: false });
  
  const service = new GenerationService(mockFederationEngine, mockFeatureStore, privacyValidator);
  
  const context = new ExecutionContext({
    executionId: 'exec-1',
    workspaceId: 'ws-1',
    tenantId: 'tenant-123',
    userId: 'user-1',
    variables: {},
    secretRefs: {},
    policies: []
  });

  await assert.rejects(
    async () => {
      await service.triggerGeneration({ id: 'gen-2', type: 'tabular', schema: {}, targetRows: 100 }, context);
    },
    (err: any) => err.message === 'Privacy evaluation failed on generated dataset'
  );

  privacyValidator.evaluate = originalEvaluate;
});

test('generation service throws UnauthorizedException if tenant is missing', async () => {
  const mockFederationEngine: IFederationEngine = {
    query: async () => []
  };
  const mockFeatureStore = new FeatureStoreService();
  const privacyValidator = new PrivacyValidator();
  const service = new GenerationService(mockFederationEngine, mockFeatureStore, privacyValidator);
  
  const context = new ExecutionContext({
    executionId: 'exec-1',
    workspaceId: 'ws-1',
    tenantId: '', // Invalid tenant
    userId: 'user-1',
    variables: {},
    secretRefs: {},
    policies: []
  });

  await assert.rejects(
    async () => {
      await service.triggerGeneration({ id: 'gen-1', type: 'tabular', schema: {}, targetRows: 100 }, context);
    },
    (err: any) => err instanceof UnauthorizedException
  );
});

test('privacy validator enforces k-anonymity checks on generated output', () => {
  const validator = new PrivacyValidator();
  
  const passingDataset = [
    { age: '20-30', zip: '123**', condition: 'A' },
    { age: '20-30', zip: '123**', condition: 'B' },
    { age: '20-30', zip: '123**', condition: 'C' }
  ];
  const resultPass = validator.evaluate(passingDataset, { k: 3, quasiIdentifiers: ['age', 'zip'] });
  assert.equal(resultPass.compliant, true);

  const failingDataset = [
    { age: '40-50', zip: '99999', condition: 'Rare' }
  ];
  const resultFail = validator.evaluate(failingDataset, { k: 3, quasiIdentifiers: ['age', 'zip'] });
  assert.equal(resultFail.compliant, false);
});

test('controller performs runtime request validation', async () => {
  const mockFederationEngine: IFederationEngine = { query: async () => [] };
  const mockFeatureStore = new FeatureStoreService();
  const privacyValidator = new PrivacyValidator();
  const service = new GenerationService(mockFederationEngine, mockFeatureStore, privacyValidator);
  const controller = new GenerationController(service);

  const context = new ExecutionContext({
    executionId: 'exec-1',
    workspaceId: 'ws-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
    variables: {},
    secretRefs: {},
    policies: []
  });

  assert.throws(() => controller.triggerGeneration(null as any, context), BadRequestException);
  assert.throws(() => controller.triggerGeneration({ id: 'gen-bad' } as any, context), BadRequestException);
});
