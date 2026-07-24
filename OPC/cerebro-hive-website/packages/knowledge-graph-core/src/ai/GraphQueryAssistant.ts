import { GraphPlanner } from '../planner/GraphPlanner';
import { SemanticNode } from '../domain/SemanticNode';

export class GraphQueryAssistant {
  constructor(private readonly planner: GraphPlanner) {}

  async ask(question: string): Promise<string> {
    console.log(`\n[User] ${question}`);
    
    // Simulate LLM translating Natural Language to Intent
    const intent = question; 
    
    // Planner executes graph operations
    const results = await this.planner.executePlan(intent);
    
    // Simulate LLM Summarizing Results
    return this.summarize(results);
  }

  private summarize(nodes: SemanticNode[]): string {
    if (nodes.length === 0) return '[Assistant] No impacted entities found.';
    const summaries = nodes.map(n => `- ${n.kind}: ${n.id} (Labels: ${n.labels.join(', ')})`);
    return `[Assistant] Found ${nodes.length} impacted entities:\n${summaries.join('\n')}`;
  }
}
