import { KnowledgeGraphService, globalKnowledgeGraph } from "./knowledge-graph.js";

// ---------------------------------------------------------------------------------------------
// Reasoning Provider Abstraction
// ---------------------------------------------------------------------------------------------

export interface ReasoningProvider {
  inferMissingLinks(entityId: string): { source: string, target: string, relationship: string, confidence: number, explanation: string }[];
  detectConflicts(entityId: string): { conflict: string, severity: "High" | "Medium" | "Low", explanation: string }[];
  recommendOpportunities(entityId: string): { opportunity: string, confidence: number, explanation: string }[];
}

// ---------------------------------------------------------------------------------------------
// Rule-Based Reasoner
// ---------------------------------------------------------------------------------------------

export class RuleBasedReasoner implements ReasoningProvider {
  private graph: KnowledgeGraphService;

  constructor(graph: KnowledgeGraphService) {
    this.graph = graph;
  }

  inferMissingLinks(entityId: string) {
    const entity = this.graph.getEntity(entityId);
    if (!entity) return [];
    
    const inferences = [];
    
    // Example Rule: If Model M depends_on Framework F, and Framework F depends_on Language L,
    // then Model M implicitly depends_on Language L.
    const outEdges = this.graph.getEdgesFor(entityId, "out");
    for (const edge of outEdges) {
      if (edge.type === "depends_on") {
        const fwEdges = this.graph.getEdgesFor(edge.targetId, "out");
        for (const fEdge of fwEdges) {
          if (fEdge.type === "depends_on" && fEdge.targetId !== entityId) {
            inferences.push({
              source: entityId,
              target: fEdge.targetId,
              relationship: "depends_on",
              confidence: 0.85,
              explanation: `${entity.canonicalName} depends on a framework that depends on this target.`
            });
          }
        }
      }
    }

    return inferences;
  }

  detectConflicts(entityId: string) {
    const entity = this.graph.getEntity(entityId);
    if (!entity) return [];
    
    const conflicts = [];
    const inEdges = this.graph.getEdgesFor(entityId, "in");
    
    // Example Rule: If a Model is deprecated but highly commercialized, flag conflict.
    if (entity.deprecated && entity.type === "Model") {
      const uses = inEdges.filter(e => e.type === "uses" || e.type === "commercialized_as");
      if (uses.length > 3) {
        conflicts.push({
          conflict: "Deprecated Dependency",
          severity: "High" as const,
          explanation: `${entity.canonicalName} is deprecated but still widely used by enterprise products.`
        });
      }
    }

    return conflicts;
  }

  recommendOpportunities(entityId: string) {
    const entity = this.graph.getEntity(entityId);
    if (!entity) return [];
    
    const recommendations = [];
    
    // Example Rule: If a new hardware architecture is added but has no models optimized for it.
    if (entity.type === "Hardware") {
      const inEdges = this.graph.getEdgesFor(entityId, "in");
      const optimizations = inEdges.filter(e => e.type === "optimized_for");
      if (optimizations.length === 0) {
        recommendations.push({
          opportunity: `Optimization Framework for ${entity.canonicalName}`,
          confidence: 0.9,
          explanation: `New hardware ${entity.canonicalName} currently lacks models optimized for it. High opportunity to build a compilation/optimization layer.`
        });
      }
    }

    return recommendations;
  }
}

export const globalReasoningProvider = new RuleBasedReasoner(globalKnowledgeGraph);
