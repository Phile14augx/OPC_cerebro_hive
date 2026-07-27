import { TaskDAG, TaskNode, emitSwarmEvent } from '@cerebro/swarm-sdk';
import { ExecutionStateStore, ArtifactStore } from './ExecutionStateStore';
import { WorkerPool } from './WorkerPool';

export interface ExecutionProvider {
  execute(node: TaskNode, context: any, cancelToken: { cancelled: boolean }): Promise<any>;
}

export class WorkerThreadProvider implements ExecutionProvider {
  constructor(private pool: WorkerPool) {}

  async execute(node: TaskNode, context: any, cancelToken: { cancelled: boolean }): Promise<any> {
    return this.pool.dispatchToWorker(node, context, cancelToken);
  }
}

export class ExecutionEngine {
  private inDegree = new Map<string, number>();
  private adjacencyList = new Map<string, string[]>(); // node -> children
  private readyQueue: TaskNode[] = [];
  
  private workerPool = new WorkerPool();
  private stateStore = new ExecutionStateStore();
  private artifactStore = new ArtifactStore();
  
  private activeTasks = new Set<string>();
  private cancelTokens = new Map<string, { cancelled: boolean }>();
  private dagMap = new Map<string, TaskNode>();
  private retryCounts = new Map<string, number>();

  constructor(private provider: ExecutionProvider) {}

  async run(dag: TaskDAG) {
    emitSwarmEvent('WORKFLOW_STARTED', { dagId: dag.id });
    this.buildGraph(dag);
    
    // Initial Dispatch
    this.dispatchLoop();
  }

  private buildGraph(dag: TaskDAG) {
    dag.nodes.forEach(n => {
      n.status = 'PENDING';
      this.inDegree.set(n.id, 0);
      this.adjacencyList.set(n.id, []);
      this.dagMap.set(n.id, n);
    });

    dag.edges.forEach(e => {
      this.adjacencyList.get(e.from)!.push(e.to);
      this.inDegree.set(e.to, this.inDegree.get(e.to)! + 1);
    });

    dag.nodes.forEach(n => {
      if (this.inDegree.get(n.id) === 0) {
        this.transitionState(n, 'READY');
      }
    });
  }

  private dispatchLoop() {
    // Sort ready queue by priority
    this.readyQueue.sort((a, b) => b.profile.priority - a.profile.priority);

    // Greedily dispatch as long as capacity exists
    for (let i = 0; i < this.readyQueue.length; i++) {
      const node = this.readyQueue[i];
      if (this.workerPool.hasCapacity(node.profile)) {
        this.readyQueue.splice(i, 1);
        i--; // Adjust index
        
        this.workerPool.allocate(node.profile);
        this.activeTasks.add(node.id);
        this.executeNode(node);
      }
    }
  }

  private async executeNode(node: TaskNode) {
    this.transitionState(node, 'RUNNING');
    
    const cancelToken = { cancelled: false };
    this.cancelTokens.set(node.id, cancelToken);

    try {
      const context = await this.resolveContext(node);
      const result = await this.provider.execute(node, context, cancelToken);
      
      const artifactRef = await this.artifactStore.saveArtifact(result);
      await this.stateStore.saveContext(node.id, { artifactRef, summary: 'Task completed' });

      this.transitionState(node, 'COMPLETED');
      this.handleTaskCompletion(node);
    } catch (err: any) {
      if (err.message.includes('Cancelled')) {
        this.transitionState(node, 'CANCELLED');
      } else {
        await this.handleTaskError(node, err);
      }
    } finally {
      this.workerPool.release(node.profile);
      this.activeTasks.delete(node.id);
      this.dispatchLoop();
    }
  }

  private async handleTaskError(node: TaskNode, err: Error) {
    const retries = this.retryCounts.get(node.id) || 0;
    const maxRetries = node.profile.retryLimit || 3;

    if (retries < maxRetries && err.name !== 'FatalError') {
      this.retryCounts.set(node.id, retries + 1);
      const backoff = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoff));
      this.transitionState(node, 'READY');
    } else {
      await this.artifactStore.moveToDeadLetterQueue(node.id, err);
      this.transitionState(node, 'FAILED');
      this.handleTaskFailure(node);
    }
  }

  private async resolveContext(node: TaskNode) {
    let resolved = {};
    for (const parentId of node.dependencies) {
      const pCtx = await this.stateStore.getContext(parentId);
      resolved = { ...resolved, [parentId]: pCtx };
    }
    return resolved;
  }

  private handleTaskCompletion(node: TaskNode) {
    const children = this.adjacencyList.get(node.id) || [];
    for (const childId of children) {
      const currentInDegree = this.inDegree.get(childId)! - 1;
      this.inDegree.set(childId, currentInDegree);
      
      if (currentInDegree === 0) {
        const childNode = this.dagMap.get(childId)!;
        if (childNode.status === 'PENDING') {
          this.transitionState(childNode, 'READY');
        }
      }
    }
  }

  private handleTaskFailure(node: TaskNode) {
    const children = this.adjacencyList.get(node.id) || [];
    for (const childId of children) {
      const childNode = this.dagMap.get(childId)!;
      if (childNode.status === 'PENDING') {
        this.transitionState(childNode, 'SKIPPED');
        this.handleTaskFailure(childNode);
      }
    }
  }

  private transitionState(node: TaskNode, newState: TaskStatus) {
    node.status = newState;
    emitSwarmEvent(`NODE_${newState}`, { taskId: node.id });
    
    if (newState === 'READY') {
      this.readyQueue.push(node);
    }
  }

  cancelWorkflow() {
    this.cancelTokens.forEach(t => t.cancelled = true);
    emitSwarmEvent('WORKFLOW_FAILED', { reason: 'Cancelled by operator' });
  }
}
