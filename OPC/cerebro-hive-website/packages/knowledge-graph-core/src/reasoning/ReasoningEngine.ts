import { KnowledgeGraphPort } from '../ports/KnowledgeGraphPort';
import { GraphAlgorithms } from '../algorithms/GraphAlgorithms';
import { NodeKind } from '../ontology/Ontology';

export interface ReasoningResult {
  ruleName: string;
  passed: boolean;
  violations: string[]; // Node IDs or messages
}

export class ReasoningEngine {
  constructor(
    private readonly graph: KnowledgeGraphPort,
    private readonly algorithms: GraphAlgorithms
  ) {}

  // Example Reasoning Rule: "No MissionCritical Service should depend on an Unapproved AI Model"
  async evaluateMissionCriticalAI(): Promise<ReasoningResult> {
    const violations: string[] = [];
    
    // 1. Find all Mission Critical Services
    const mcServices = await this.graph.findNodes({
      matchNodeKind: NodeKind.BusinessService,
      matchLabels: ['MissionCritical']
    });

    // 2. For each, blast radius (dependencies)
    for (const service of mcServices) {
      // Find what this service depends on
      const dependencies = await this.algorithms.getDependencies(service.id, 5);
      
      const unapprovedModels = dependencies.filter(node => 
        node.kind === NodeKind.AIModel && 
        node.properties['status'] !== 'Approved' &&
        node.properties['status'] !== 'Deployed'
      );

      if (unapprovedModels.length > 0) {
        violations.push(`Service ${service.id} relies on unapproved models: ${unapprovedModels.map(m => m.id).join(', ')}`);
      }
    }

    return {
      ruleName: 'MissionCritical_AI_Approval',
      passed: violations.length === 0,
      violations
    };
  }
}
