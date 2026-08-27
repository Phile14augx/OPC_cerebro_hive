import { Injectable, BadRequestException } from '@nestjs/common';

export interface PipelineStep {
  name: string;
  dependsOn?: string[];
  action?: string;
}

export interface PipelineDefinition {
  steps: PipelineStep[];
}

@Injectable()
export class PipelineService {
  validateDAG(def: PipelineDefinition): void {
    if (!def.steps) {
      throw new BadRequestException('Pipeline must have steps');
    }

    const graph = new Map<string, string[]>();
    const allNodes = new Set<string>();

    for (const step of def.steps) {
      graph.set(step.name, step.dependsOn || []);
      allNodes.add(step.name);
    }

    // Check for missing dependencies
    for (const step of def.steps) {
      for (const dep of step.dependsOn || []) {
        if (!allNodes.has(dep)) {
          throw new BadRequestException(`Missing dependency: ${dep}`);
        }
      }
    }

    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (node: string) => {
      if (visiting.has(node)) throw new BadRequestException(`Cycle detected at node: ${node}`);
      if (visited.has(node)) return;
      
      visiting.add(node);
      const deps = graph.get(node) || [];
      for (const dep of deps) {
        visit(dep);
      }
      visiting.delete(node);
      visited.add(node);
    };

    for (const node of allNodes) {
      if (!visited.has(node)) {
        visit(node);
      }
    }
  }

  async executePipeline(def: PipelineDefinition): Promise<string[]> {
    this.validateDAG(def);

    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const step of def.steps) {
      graph.set(step.name, []);
      inDegree.set(step.name, 0);
    }

    for (const step of def.steps) {
      const deps = step.dependsOn || [];
      inDegree.set(step.name, deps.length);
      for (const dep of deps) {
        if (!graph.has(dep)) {
            graph.set(dep, []);
        }
        graph.get(dep)!.push(step.name);
      }
    }

    const queue: string[] = [];
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(node);
    }

    const executionOrder: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      executionOrder.push(current);
      
      const children = graph.get(current) || [];
      for (const child of children) {
        const currentDegree = inDegree.get(child)! - 1;
        inDegree.set(child, currentDegree);
        if (currentDegree === 0) {
          queue.push(child);
        }
      }
    }

    // Simulate actual execution delay or logic
    for (const stepName of executionOrder) {
      console.log(`Executing step: ${stepName}`);
    }

    return executionOrder;
  }
}
