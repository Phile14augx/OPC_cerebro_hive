import { Injectable } from '@nestjs/common';
import { GetOnlineFeaturesDto, GenerateOfflineDatasetDto, RegisterFeatureViewDto } from './dto/feature-store.dto';

@Injectable()
export class FeatureStoreService {
  private featureViews: Record<string, Record<string, RegisterFeatureViewDto>> = {};
  private datasets: Record<string, Record<string, GenerateOfflineDatasetDto & { jobId: string, status: string }>> = {};

  getOnlineFeatures(tenantId: string, dto: GetOnlineFeaturesDto) {
    if (!this.featureViews[tenantId]?.[dto.feature_service]) {
      throw new Error(`Feature service ${dto.feature_service} not found for tenant ${tenantId}`);
    }

    try {
      return {
        results: dto.entities.map((entity) => {
          // Simulate some lookup logic
          const key = Object.values(entity).join(':');
          if (key === 'fail') throw new Error('Simulated dependency failure during feature retrieval');
          return {
            entity,
            features: {
              tenant: tenantId,
              total_purchases_30d: 15,
              avg_session_length: 120.5,
              user_embedding: [0.12, -0.45, 0.88],
            },
          };
        }),
      };
    } catch (e) {
      const err = e as Error;
      throw new Error(`Dependency error: ${err.message}`);
    }
  }

  generateOfflineDataset(tenantId: string, dto: GenerateOfflineDatasetDto) {
    if (dto.feature_list.length === 0) {
      throw new Error('Feature list cannot be empty');
    }

    const jobId = `job-${Math.random().toString(36).substr(2, 6)}`;

    if (!this.datasets[tenantId]) {
      this.datasets[tenantId] = {};
    }

    const job = {
      ...dto,
      jobId,
      status: 'SUBMITTED',
    };

    this.datasets[tenantId][jobId] = job;

    return {
      job_id: jobId,
      status: job.status,
      format: dto.format,
    };
  }

  registerFeatureView(tenantId: string, dto: RegisterFeatureViewDto) {
    if (!this.featureViews[tenantId]) {
      this.featureViews[tenantId] = {};
    }

    if (this.featureViews[tenantId][dto.name]) {
      throw new Error(`Feature view ${dto.name} already exists for tenant ${tenantId}`);
    }

    this.featureViews[tenantId][dto.name] = dto;

    return {
      version: 1,
      status: 'CREATED',
      uri: `/api/v1/registry/feature-views/${dto.name}/v1`,
    };
  }
}
