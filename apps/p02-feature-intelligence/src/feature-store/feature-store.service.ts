import { Injectable } from '@nestjs/common';

@Injectable()
export class FeatureStoreService {
  getOnlineFeatures(featureService: string, entities: any[]) {
    return {
      results: entities.map((entity) => ({
        entity,
        features: {
          mock_feature: 1.0,
        },
      })),
    };
  }

  generateOfflineDataset(req: any) {
    return {
      job_id: 'mock-job-123',
      status: 'SUBMITTED',
    };
  }

  registerFeatureView(req: any) {
    return {
      version: 1,
      status: 'CREATED',
      uri: `/api/v1/registry/feature-views/${req.name}/v1`,
    };
  }
}
