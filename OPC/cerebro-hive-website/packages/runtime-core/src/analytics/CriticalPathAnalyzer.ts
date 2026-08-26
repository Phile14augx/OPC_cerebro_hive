import { RuleResult } from '../governance/GovernanceRule';
import { CriticalPathReport, IAnalyzer } from './GovernanceAnalytics';

export class CriticalPathAnalyzer implements IAnalyzer<CriticalPathReport> {
  analyze(results: RuleResult[]): CriticalPathReport {
    if (results.length === 0) return { pathRuleIds: [], totalLatencyMs: 0 };

    const graph = new Map<string, string[]>(); // node -> dependents
    const inDegree = new Map<string, number>();
    const ruleDurations = new Map<string, number>();
    const rules = new Set<string>();

    for (const res of results) {
      rules.add(res.ruleId);
      ruleDurations.set(res.ruleId, res.metadata?.durationMs || 0);
      if (!graph.has(res.ruleId)) graph.set(res.ruleId, []);
      if (!inDegree.has(res.ruleId)) inDegree.set(res.ruleId, 0);
    }

    // Build the graph using resolvedDependencies (edges go from dependency -> rule)
    for (const res of results) {
      if (res.metadata?.resolvedDependencies) {
        for (const dep of res.metadata.resolvedDependencies) {
          if (rules.has(dep)) {
            graph.get(dep)?.push(res.ruleId);
            inDegree.set(res.ruleId, (inDegree.get(res.ruleId) || 0) + 1);
          }
        }
      }
    }

    // Topological Sort
    const queue: string[] = [];
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(node);
    }

    const topo: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift();
      if (!node) break;
      topo.push(node);
      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        if (inDegree.get(neighbor) === 0) queue.push(neighbor);
      }
    }

    // Longest path DP
    const dist = new Map<string, number>();
    const parent = new Map<string, string>();
    
    for (const node of topo) {
      if (!dist.has(node)) dist.set(node, ruleDurations.get(node) || 0);
      
      const currentDist = dist.get(node) || 0;
      
      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        const altDist = currentDist + (ruleDurations.get(neighbor) || 0);
        if (!dist.has(neighbor) || altDist > (dist.get(neighbor) || 0)) {
          dist.set(neighbor, altDist);
          parent.set(neighbor, node);
        }
      }
    }

    // Find the max distance node
    let maxDist = -1;
    let endNode = '';
    for (const [node, d] of dist.entries()) {
      if (d > maxDist) {
        maxDist = d;
        endNode = node;
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let curr: string | undefined = endNode;
    while (curr) {
      path.unshift(curr);
      curr = parent.get(curr);
    }

    return {
      pathRuleIds: path,
      totalLatencyMs: maxDist === -1 ? 0 : maxDist
    };
  }
}
