import { KnowledgeGraphPort } from '../ports/KnowledgeGraphPort';
import { GraphAlgorithms } from '../algorithms/GraphAlgorithms';
import { SemanticNode } from '../domain/SemanticNode';

export class GraphPlanner {
  constructor(
    private readonly graph: KnowledgeGraphPort,
    private readonly algorithms: GraphAlgorithms
  ) {}

  // Simulates translating LLM intent into a graph execution plan
  async executePlan(intent: string): Promise<SemanticNode[]> {
    console.log(`[Planner] Translating intent: "${intent}"`);
    
    if (intent.includes('MissionCritical') && intent.includes('GPT-5')) {
      console.log(`[Planner] Plan: Find 'GPT-5' -> Blast Radius -> Filter 'MissionCritical'`);
      
      const aiModels = await this.graph.findNodes({ matchNodeKind: 'AIModel' });
      const gpt5 = aiModels.find(m => m.properties.name === 'GPT-5');
      
      if (!gpt5) return [];

      const impacted = await this.algorithms.getBlastRadius(gpt5.id, 5);
      return impacted.filter(n => n.labels.includes('MissionCritical'));
    }

    return [];
  }
}
