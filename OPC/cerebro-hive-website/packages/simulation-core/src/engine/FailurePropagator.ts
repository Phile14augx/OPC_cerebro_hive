import { DigitalTwinEngine } from './DigitalTwinEngine';
import { SemanticNode, GraphAlgorithms, NodeKind } from '../../../knowledge-graph-core/src/index';

export class FailurePropagator {
  private algorithms: GraphAlgorithms;

  constructor(private readonly twin: DigitalTwinEngine) {
    this.algorithms = new GraphAlgorithms(twin);
  }

  // Injects a failure, deletes the node from the twin overlay, and calculates cascading failures
  async simulateNodeFailure(nodeId: string): Promise<SemanticNode[]> {
    console.log(`[Simulation] Injecting NodeFailure for: ${nodeId}`);
    
    // First, find who will be impacted BEFORE we remove it (so we can traverse its incoming edges)
    const impacted = await this.algorithms.getBlastRadius(nodeId, 5);

    // Now sever the node in the digital twin
    await this.twin.removeNode(nodeId);

    // We can further refine this by checking if the impacted nodes have redundant paths.
    // For this prototype, we assume strict dependencies fail entirely if the target fails.
    
    // Return the business capabilities and services impacted
    const cascadingFailures = impacted.filter(n => 
      n.kind === NodeKind.BusinessCapability || 
      n.kind === NodeKind.BusinessService
    );

    return cascadingFailures;
  }
}
