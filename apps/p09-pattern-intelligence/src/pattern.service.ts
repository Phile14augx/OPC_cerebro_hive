import { IngestionEngine } from './ingestion.engine';
import { PatternRepository } from './pattern.repository';
import { DataPoint, TenantContext } from './types';

export class PatternService {
  constructor(
    private ingestionEngine: IngestionEngine,
    private patternRepository: PatternRepository
  ) {}

  async analyze(tenantContext: TenantContext, request: { sourceId: string; data: DataPoint[] }) {
    if (!tenantContext || !tenantContext.tenantId) {
      throw new Error('Unauthorized access: Invalid TenantContext');
    }

    await this.ingestionEngine.ingest(tenantContext, request.sourceId, request.data);

    return {
      jobId: 'job-' + Date.now(),
      status: 'success'
    };
  }
}
