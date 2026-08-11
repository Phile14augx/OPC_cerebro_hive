import { ExecutionPlan, ExecutionPlanNode } from '../orchestration/models';
import { IArtifactCache } from './ArtifactCache';
import { CacheValidator } from './CacheValidator';
import { IArtifactFingerprinter } from './ArtifactFingerprinter';
import { ExecutionCacheKey, ExecutionOptions, ExecutionReuseDecision, CacheSnapshot } from './models';

export class CacheResolver {
  constructor(
    private readonly cache: IArtifactCache,
    private readonly validator: CacheValidator,
    private readonly fingerprinter: IArtifactFingerprinter
  ) {}

  async resolvePlan(
    plan: ExecutionPlan, 
    options: ExecutionOptions,
    tenantId: string
  ): Promise<{ optimizedPlan: ExecutionPlan, snapshot: CacheSnapshot }> {
    const optimizedNodes: ExecutionPlanNode[] = [];
    const nodeDecisions: Record<string, ExecutionReuseDecision> = {};

    for (const node of plan.nodes) {
      if (options.bypassCache) {
        optimizedNodes.push(node);
        nodeDecisions[node.nodeId] = { decision: 'Execute', reason: 'Cache bypassed by options' };
        continue;
      }

      if (options.refreshCache) {
        optimizedNodes.push(node);
        nodeDecisions[node.nodeId] = { decision: 'ForceRefresh', reason: 'Force refresh requested' };
        continue;
      }

      // Scaffold: Assume all target artifacts produce a combined fingerprint
      const fingerprints = await Promise.all(
        node.request.targetArtifacts.map(a => this.fingerprinter.fingerprint(a))
      );
      
      const combinedFingerprint = {
        algorithm: fingerprints[0]?.algorithm || 'sha256',
        version: fingerprints[0]?.version || '1.0',
        digest: fingerprints.map(f => f.digest).join('-')
      };

      const cacheKey: ExecutionCacheKey = {
        tenantId,
        repositoryId: 'default-repo', // Scaffolded
        analyzerId: node.request.analyzerId,
        analyzerVersion: node.request.analyzerVersion,
        artifactFingerprint: combinedFingerprint
      };

      const cachedEntry = await this.cache.get(cacheKey);
      
      if (!cachedEntry) {
        if (options.useCacheOnly) {
          nodeDecisions[node.nodeId] = { decision: 'Skip', reason: 'Cache miss but useCacheOnly is set', cacheKey };
        } else {
          optimizedNodes.push(node);
          nodeDecisions[node.nodeId] = { decision: 'Execute', reason: 'Cache miss', cacheKey };
        }
        continue;
      }

      const validation = this.validator.validate(cachedEntry);
      
      if (validation === 'Valid') {
        nodeDecisions[node.nodeId] = { 
          decision: 'ReuseCachedResult', 
          reason: 'Valid cache hit', 
          cacheKey,
          originalExecutionId: cachedEntry.metadata.executionId,
          analyzerVersion: cachedEntry.metadata.analyzerVersion,
          ageMs: Date.now() - cachedEntry.createdAt,
          savedDurationMs: cachedEntry.metadata.executionDurationMs
        };
        // We do NOT add it to optimizedNodes (pruning it from execution)
      } else {
        if (options.useCacheOnly) {
          nodeDecisions[node.nodeId] = { decision: 'Skip', reason: `Cache hit was ${validation} but useCacheOnly is set`, cacheKey };
        } else {
          optimizedNodes.push(node);
          nodeDecisions[node.nodeId] = { decision: 'Execute', reason: `Cache hit was ${validation}`, cacheKey };
        }
      }
    }

    const snapshot: CacheSnapshot = {
      generatedAt: Date.now(),
      nodeDecisions
    };

    const optimizedPlan: ExecutionPlan = {
      ...plan,
      nodes: optimizedNodes
    };

    return { optimizedPlan, snapshot };
  }
}
