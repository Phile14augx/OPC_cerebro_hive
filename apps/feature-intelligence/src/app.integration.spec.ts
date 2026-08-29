import { BadRequestException } from '@nestjs/common';
import { FeatureStoreService } from './feature-store/feature-store.service';
import { EmbeddingPipelineService } from './embedding/embedding-pipeline.service';
import { FeatureStoreController } from './feature-store/feature-store.controller';

describe('Feature Intelligence Integration (e2e)', () => {
  let featureStoreService: FeatureStoreService;
  let embeddingService: EmbeddingPipelineService;
  let featureStoreController: FeatureStoreController;

  beforeAll(() => {
    featureStoreService = new FeatureStoreService();
    embeddingService = new EmbeddingPipelineService();
    featureStoreController = new FeatureStoreController(featureStoreService);
  });

  describe('Tenant Isolation & Validation', () => {
    it('should reject requests without tenant ID', () => {
      expect(() => {
        featureStoreController.getOnlineFeatures('', {
          feature_service: 'default',
          entities: [{ user_id: '123' }],
        });
      }).toThrow(BadRequestException);
    });
  });

  describe('Feature Store Behavioral Tests', () => {
    it('should register feature view and retrieve online features with state isolation', () => {
      // 1. Register for tenant A
      const res1 = featureStoreController.registerFeatureView('tenant-a', {
        name: 'user_features',
        entities: ['user_id'],
        features: [{ name: 'age', type: 'INT' }],
        transformation_query: 'SELECT age FROM users',
      });
      expect(res1.status).toBe('CREATED');

      // 2. Retrieve online features for tenant A
      const res2 = featureStoreController.getOnlineFeatures('tenant-a', {
        feature_service: 'user_features',
        entities: [{ user_id: '123' }],
      });
      expect(res2.results[0].features.tenant).toBe('tenant-a');
    });

    it('should prevent cross-tenant access to feature views', () => {
      expect(() => {
        featureStoreController.getOnlineFeatures('tenant-b', {
          feature_service: 'user_features',
          entities: [{ user_id: '123' }],
        });
      }).toThrow('not found for tenant tenant-b');
    });

    it('should propagate dependency failures', () => {
      expect(() => {
        featureStoreController.getOnlineFeatures('tenant-a', {
          feature_service: 'user_features',
          entities: [{ user_id: 'fail' }],
        });
      }).toThrow('Dependency error');
    });
  });

  describe('Embedding Pipeline Behavioral Tests', () => {
    it('should process embeddings with isolation', async () => {
      const res = await embeddingService.processEmbeddings('tenant-c', {
        items: [{ id: 'doc1' }],
        model: 'm1',
      });
      expect(res.status).toBe('processed');
      expect(res.processed_count).toBe(1);
      expect(res.items[0].vector.length).toBe(3);
    });

    it('should propagate failure in embeddings', async () => {
      await expect(
        embeddingService.processEmbeddings('tenant-c', {
          items: [{ id: 'fail' }],
        })
      ).rejects.toThrow('Embedding dependency failed');
    });
  });
});
