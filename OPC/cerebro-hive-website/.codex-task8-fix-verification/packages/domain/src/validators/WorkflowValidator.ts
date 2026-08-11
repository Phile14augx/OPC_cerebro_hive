import { ValidDagSpecification } from '../specifications/WorkflowSpecifications';

export class WorkflowValidator {
  private validDagSpec = new ValidDagSpecification();

  validatePublish(nodes: any[], edges: any[]) {
    const errors: string[] = [];
    if (!nodes || nodes.length === 0) errors.push("Workflow must contain at least one node.");
    if (!this.validDagSpec.isSatisfiedBy(nodes, edges)) errors.push("Workflow contains invalid edges with missing nodes.");

    if (errors.length > 0) {
      throw new Error(`Validation failed for Workflow: ${errors.join(', ')}`);
    }
  }
}
