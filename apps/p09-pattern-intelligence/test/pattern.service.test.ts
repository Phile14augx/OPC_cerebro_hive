import * as assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';
import { PatternService } from '../src/pattern.service';
import { TenantContext } from '../src/types';
import { IngestionEngine } from '../src/ingestion.engine';
import { AnalysisPipeline } from '../src/analysis.pipeline';
import { PatternRepository } from '../src/pattern.repository';
import { AlertingSystem } from '../src/alerting.system';

describe('Pattern Intelligence', () => {
  let service: PatternService;
  let ingestionEngine: IngestionEngine;
  let analysisPipeline: AnalysisPipeline;
  let patternRepository: PatternRepository;
  let alertingSystem: AlertingSystem;
  let tenantContext: TenantContext;

  beforeEach(() => {
    patternRepository = new PatternRepository();
    alertingSystem = new AlertingSystem();
    analysisPipeline = new AnalysisPipeline(patternRepository, alertingSystem);
    ingestionEngine = new IngestionEngine(analysisPipeline);
    service = new PatternService(ingestionEngine, patternRepository);

    tenantContext = {
      tenantId: 'tenant-123',
      roles: ['admin']
    };
  });

  it('should reject requests without a valid tenant context (zero-trust)', async () => {
    await assert.rejects(async () => {
      await service.analyze(null as any, { sourceId: 'src-123', data: [] });
    }, /Unauthorized/);
  });

  it('should ingest data stream and store under tenant isolation', async () => {
    const dataPoints = [ { value: 10, timestamp: Date.now() } ];
    await ingestionEngine.ingest(tenantContext, 'src-123', dataPoints);
    
    // verify data is stored for this tenant only
    const data = ingestionEngine.getTenantData(tenantContext, 'src-123');
    assert.strictEqual(data.length, 1);

    // zero trust cross-tenant access check
    const otherTenant: TenantContext = { tenantId: 'tenant-999', roles: [] };
    const otherData = ingestionEngine.getTenantData(otherTenant, 'src-123');
    assert.strictEqual(otherData.length, 0, 'Should not access data from another tenant');
  });

  it('should detect anomalies using the analysis pipeline and trigger alerts', async () => {
    // Normal data
    const normalData = [
      { value: 10, timestamp: Date.now() - 3000 },
      { value: 12, timestamp: Date.now() - 2000 },
      { value: 11, timestamp: Date.now() - 1000 },
    ];
    await ingestionEngine.ingest(tenantContext, 'src-anomaly', normalData);
    
    // Anomaly data (spike)
    const anomalyData = [ 
      { value: 100, timestamp: Date.now() },
      { value: 150, timestamp: Date.now() + 1000 }
    ];
    await ingestionEngine.ingest(tenantContext, 'src-anomaly', anomalyData);

    // Another batch in the same anomaly window
    const anomalyData2 = [ { value: 120, timestamp: Date.now() + 2000 } ];
    await ingestionEngine.ingest(tenantContext, 'src-anomaly', anomalyData2);

    const patterns = patternRepository.getPatterns(tenantContext);
    assert.strictEqual(patterns.length, 1, 'Should have discovered exactly one pattern per anomaly window');
    assert.strictEqual(patterns[0].type, 'anomaly');

    const alerts = alertingSystem.getAlerts(tenantContext);
    assert.strictEqual(alerts.length, 1, 'Should have triggered exactly one alert per anomaly window');
    assert.strictEqual(alerts[0].sourceId, 'src-anomaly');
  });

  it('PatternService analyze endpoint should orchestrate ingestion and return status', async () => {
    const result = await service.analyze(tenantContext, {
      sourceId: 'src-123',
      data: [{ value: 42, timestamp: Date.now() }]
    });

    assert.strictEqual(result.status, 'success');
    assert.ok(result.jobId);
    
    const data = ingestionEngine.getTenantData(tenantContext, 'src-123');
    assert.strictEqual(data.length, 1);
  });
});
