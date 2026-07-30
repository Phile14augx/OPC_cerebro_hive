import { describe, expect, it } from 'vitest';
import { SemgrepAdapter } from '../adapters/SemgrepAdapter';
import { TrivyAdapter } from '../adapters/TrivyAdapter';
import { AnalyzerExecutionRequest } from '../models';

describe('Analyzer Contracts (M26.6f)', () => {
  const mockRequest: AnalyzerExecutionRequest = {
    executionId: 'exec-123',
    targetArtifacts: [
      {
        artifactId: 'art-1',
        type: 'source_code',
        checksum: 'sha256:mock',
        mediaType: 'application/x-tar',
        sizeBytes: 1024,
        accessMode: 'mount',
      },
    ],
    limits: {
      cpuUnits: 1,
      memoryMb: 512,
      timeoutSeconds: 300,
      diskMb: 1024,
      networkEgressAllowed: false, // Mandatory sandbox invariant
      concurrency: 1,
      maxRetries: 0,
    },
    context: {},
  };

  it('SemgrepAdapter satisfies IAnalyzerAdapter and returns canonical findings', async () => {
    const adapter = new SemgrepAdapter();
    const result = await adapter.execute(mockRequest);

    expect(result.analyzerId).toBe('semgrep');
    expect(result.executionId).toBe('exec-123');
    expect(result.status).toBe('succeeded');
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings[0].category).toBeDefined();
    
    // Verifying immutability and schema format
    const finding = result.findings[0];
    expect(['critical', 'high', 'medium', 'low', 'info']).toContain(finding.severity);
  });

  it('TrivyAdapter satisfies IAnalyzerAdapter and preserves raw finding provenance', async () => {
    const adapter = new TrivyAdapter();
    const result = await adapter.execute(mockRequest);

    expect(result.analyzerId).toBe('trivy');
    expect(result.executionId).toBe('exec-123');
    expect(result.status).toBe('succeeded');
    
    // Verify provenance link exists
    const finding = result.findings[0];
    expect(finding.rawVendorFindingId).toBeDefined();
    expect(finding.rawVendorFindingId).toContain('CVE');
  });
});
