
import { ExecutionPlan, Stage } from '../compiler/ir/ExecutionPlan';
import { CompilationArtifacts } from '../compiler/engine/CompilationContext';
import { ExecutionEvent, ExecutionEventType, ExecutionSnapshot, ExecutionRecording } from './ExecutionEvents';

type RuntimeState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED' | 'ERROR';

export class SimulatorRuntime {
  private plan: ExecutionPlan;
  private artifacts: CompilationArtifacts;
  
  private state: RuntimeState = 'IDLE';
  private eventLog: ExecutionEvent[] = [];
  private snapshots: ExecutionSnapshot[] = [];
  
  private breakpoints: Set<string> = new Set(); // Node IDs to pause before/after

  // Subscribers (e.g. Debugger UI)
  private listeners: ((event: ExecutionEvent) => void)[] = [];

  constructor(plan: ExecutionPlan, artifacts: CompilationArtifacts) {
    this.plan = plan;
    this.artifacts = artifacts;
  }

  public subscribe(listener: (event: ExecutionEvent) => void) {
    this.listeners.push(listener);
  }

  private emit(type: ExecutionEventType, payload: any = {}, stageId?: string, nodeId?: string) {
    const event: ExecutionEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      payload,
      stageId,
      nodeId
    };
    this.eventLog.push(event);
    this.listeners.forEach(l => l(event));
    
    // Event-Sourced Checkpointing: Create a snapshot every 20 events
    if (this.eventLog.length % 20 === 0) {
      this.createSnapshot();
    }
  }

  private createSnapshot() {
    this.snapshots.push({
      snapshotId: crypto.randomUUID(),
      eventIndex: this.eventLog.length - 1,
      memoryState: {}, // MOCK: Clone current memory
      activeStages: []
    });
  }

  // Debugger Controls
  public async run() {
    this.state = 'RUNNING';
    this.emit('ExecutionStarted');
    // MOCK: Loop through stages...
    for (const stage of this.plan.stages) {
      if (this.state === 'PAUSED') break;
      await this.executeStage(stage);
    }
    if (this.state === 'RUNNING') {
      this.state = 'FINISHED';
      this.emit('ExecutionFinished');
    }
  }

  private async executeStage(stage: Stage) {
    this.emit('StageStarted', {}, stage.id);
    for (const nodeId of stage.nodes) {
      if (this.breakpoints.has(nodeId)) {
        this.pause(`BreakpointHit at ${nodeId}`);
        return;
      }
      this.emit('NodeStarted', {}, stage.id, nodeId);
      // Simulate node execution
      this.emit('NodeCompleted', {}, stage.id, nodeId);
    }
  }

  public pause(reason: string = 'User Paused') {
    this.state = 'PAUSED';
    this.emit('ExecutionPaused', { reason });
  }

  public resume() {
    if (this.state !== 'PAUSED') return;
    this.emit('ExecutionResumed');
    this.run();
  }

  public step() {
    // Moves execution forward by one node/stage
  }

  public stop() {
    this.state = 'IDLE';
    this.eventLog = [];
  }

  public getRecording(): ExecutionRecording {
    return {
      executionPlanId: this.plan.metadata.version,
      events: this.eventLog,
      snapshots: this.snapshots,
      metrics: { durationMs: 0, totalCost: 0 }
    };
  }
}
