import { AnalysisPipeline } from './analysis.pipeline';
import { DataPoint, TenantContext } from './types';

export class IngestionEngine {
  // Store data partitioned by tenantId -> sourceId -> DataPoint[]
  private dataStore: Map<string, Map<string, DataPoint[]>> = new Map();

  constructor(private analysisPipeline: AnalysisPipeline) {}

  async ingest(tenantContext: TenantContext, sourceId: string, dataPoints: DataPoint[]) {
    this.checkContext(tenantContext);
    const tenantId = tenantContext.tenantId;

    if (!this.dataStore.has(tenantId)) {
      this.dataStore.set(tenantId, new Map());
    }

    const tenantStore = this.dataStore.get(tenantId)!;
    if (!tenantStore.has(sourceId)) {
      tenantStore.set(sourceId, []);
    }

    const stream = tenantStore.get(sourceId)!;
    
    // Trigger analysis before adding new data to the historical baseline
    await this.analysisPipeline.analyzeStream(tenantContext, sourceId, stream, dataPoints);

    // Append new data
    stream.push(...dataPoints);
    
    // Simple retention: keep last 1000 points
    if (stream.length > 1000) {
      stream.splice(0, stream.length - 1000);
    }
  }

  getTenantData(tenantContext: TenantContext, sourceId: string): DataPoint[] {
    this.checkContext(tenantContext);
    const tenantStore = this.dataStore.get(tenantContext.tenantId);
    if (!tenantStore) return [];
    return tenantStore.get(sourceId) || [];
  }

  private checkContext(tenantContext: TenantContext) {
    if (!tenantContext || !tenantContext.tenantId) {
      throw new Error('Unauthorized access to tenant data: Invalid TenantContext');
    }
  }
}
