import { describe, expect, it } from 'vitest';
import { CacheResolver } from '../CacheResolver';
import { InMemoryArtifactCache } from '../ArtifactCache';
import { CacheValidator } from '../CacheValidator';
import { GitCommitFingerprinter } from '../ArtifactFingerprinter';
import { ExecutionPlan } from '../../orchestration/models';
import { ExecutionOptions, CacheEntry } from '../models';

describe('Caching Pipeline (M26.9)', () => {
  it('CacheResolver prunes ExecutionPlan when a valid CacheHit is found', async () => {
    const cache = new InMemoryArtifactCache();
    const validator = new CacheValidator('1.0.0');
    const fingerprinter = new GitCommitFingerprinter();
    const resolver = new CacheResolver(cache, validator, fingerprinter);

    // Mock an initial ExecutionPlan with 2 nodes
    const initialPlan: ExecutionPlan = {
      planId: 'test-plan',
      plannerVersion: '1.0.0',
      planSchemaVersion: '1.0.0',
      generatedAt: Date.now(),
      nodes: [
        {
          nodeId: 'node-1',
          request: {
            executionId: 'exec-1',
            analyzerId: 'semgrep',
            analyzerVersion: '1.0',
            targetArtifacts: [{ type: 'repository', uri: 'repo-A' }],
            limits: {} as any,
            context: {}
          },
          schedulingContext: {} as any
        },
        {
          nodeId: 'node-2',
          request: {
            executionId: 'exec-2',
            analyzerId: 'trivy',
            analyzerVersion: '1.0',
            targetArtifacts: [{ type: 'repository', uri: 'repo-A' }],
            limits: {} as any,
            context: {}
          },
          schedulingContext: {} as any
        }
      ],
      dependencies: []
    };

    // Pre-populate Cache with a hit for 'semgrep' (Node 1)
    const semgrepFingerprint = await fingerprinter.fingerprint({ type: 'repository', uri: 'repo-A' });
    const mockCacheEntry: CacheEntry = {
      cacheKey: {
        tenantId: 'tenant-1',
        repositoryId: 'default-repo',
        analyzerId: 'semgrep',
        analyzerVersion: '1.0',
        artifactFingerprint: semgrepFingerprint
      },
      result: {} as any,
      createdAt: Date.now(),
      metadata: {} as any,
      resourceUsage: {},
      schemaVersion: '1.0.0'
    };

    await cache.set(mockCacheEntry.cacheKey, mockCacheEntry);

    const options: ExecutionOptions = { bypassCache: false, refreshCache: false, useCacheOnly: false };
    const { optimizedPlan, snapshot } = await resolver.resolvePlan(initialPlan, options, 'tenant-1');

    // Asserts
    expect(optimizedPlan.nodes).toHaveLength(1);
    expect(optimizedPlan.nodes[0].nodeId).toBe('node-2'); // Node 1 was pruned

    expect(snapshot.nodeDecisions['node-1'].decision).toBe('ReuseCachedResult');
    expect(snapshot.nodeDecisions['node-2'].decision).toBe('Execute');
  });

  it('CacheValidator rejects expired entries', () => {
    const validator = new CacheValidator('1.0.0');
    
    const expiredEntry: CacheEntry = {
      cacheKey: {} as any,
      result: {} as any,
      createdAt: Date.now() - 10000,
      expiresAt: Date.now() - 5000, // Expired 5 seconds ago
      metadata: {} as any,
      resourceUsage: {},
      schemaVersion: '1.0.0'
    };

    const decision = validator.validate(expiredEntry, Date.now());
    expect(decision).toBe('Expired');
  });

  it('CacheValidator rejects schema mismatches', () => {
    const validator = new CacheValidator('2.0.0');
    
    const entry: CacheEntry = {
      cacheKey: {} as any,
      result: {} as any,
      createdAt: Date.now(),
      metadata: {} as any,
      resourceUsage: {},
      schemaVersion: '1.0.0' // Mismatch
    };

    const decision = validator.validate(entry, Date.now());
    expect(decision).toBe('SchemaMismatch');
  });
});
