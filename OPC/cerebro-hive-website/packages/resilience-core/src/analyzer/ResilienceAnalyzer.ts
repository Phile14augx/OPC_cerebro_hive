import { DependencyGraph, OperationalNode } from '../dependency/DependencyGraph';
import { BiaRegistry } from '../bia/BusinessImpactAnalysis';

export class ResilienceAnalyzer {
  constructor(private graph: DependencyGraph, private biaRegistry: BiaRegistry) {}

  /**
   * Calculates the Effective RTO of a service and flags constraint violations.
   * Effective RTO = Max(Stated RTO of Service, Max(Effective RTO of all dependencies))
   */
  analyzeService(serviceId: string) {
    const service = this.biaRegistry.getService(serviceId);
    if (!service) return;

    // 1. Calculate Effective RTO
    const effectiveRto = this.calculateEffectiveRto(serviceId, new Set());
    service.effectiveRtoHours = effectiveRto;

    // 2. Validate Constraints
    service.resilienceViolations = [];
    if (service.bia) {
      if (effectiveRto > service.bia.requiredRtoHours) {
        const violation = `RTO Violation: Required RTO is ${service.bia.requiredRtoHours}h, but Effective RTO is ${effectiveRto}h due to downstream dependencies.`;
        service.resilienceViolations.push(violation);
        console.log(`[ResilienceAnalyzer] 🚨 ${service.name} - ${violation}`);
      }
    }

    // 3. Detect SPOFs (Simple check: does this service depend on a node that has no redundancies?)
    // In a full implementation, we would model redundancy groups (e.g. Active-Active DBs).
    // For this MVP, we will assume single dependency edges are SPOFs unless modeled otherwise.
    this.detectSPOFs(serviceId);
  }

  private calculateEffectiveRto(nodeId: string, visited: Set<string>): number {
    if (visited.has(nodeId)) return 0; // Prevent cycles
    visited.add(nodeId);

    const node = this.graph.getNode(nodeId);
    if (!node) return 0;

    const deps = this.graph.getDependencies(nodeId);
    if (deps.length === 0) {
      return node.statedRtoHours;
    }

    let maxDepRto = 0;
    for (const dep of deps) {
      const depRto = this.calculateEffectiveRto(dep.targetId, visited);
      if (depRto > maxDepRto) {
        maxDepRto = depRto;
      }
    }

    return Math.max(node.statedRtoHours, maxDepRto);
  }

  private detectSPOFs(serviceId: string) {
    const deps = this.graph.getDependencies(serviceId);
    // Extremely simplified SPOF logic for demonstration:
    // If a service depends on exactly 1 database, it's a SPOF.
    const dbDeps = deps.filter(d => d.type === 'Database');
    if (dbDeps.length === 1) {
      const dbNode = this.graph.getNode(dbDeps[0].targetId);
      const service = this.biaRegistry.getService(serviceId);
      if (service && dbNode) {
        const violation = `SPOF Detected: Relies on single database '${dbNode.name}' with no redundancy.`;
        service.resilienceViolations.push(violation);
        console.log(`[ResilienceAnalyzer] ⚠️ ${service.name} - ${violation}`);
      }
    }
  }
}
