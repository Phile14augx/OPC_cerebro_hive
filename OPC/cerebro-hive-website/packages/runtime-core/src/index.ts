export type RuntimeState = 
  | 'Registered'
  | 'Initialized'
  | 'Running'
  | 'Paused'
  | 'Failed'
  | 'Stopped'
  | 'Disposed';

export interface RuntimeLifecycle {
  currentState: RuntimeState;
  
  initialize(): Promise<void>;
  start(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  dispose(): Promise<void>;
}

export abstract class BaseRuntimeObject implements RuntimeLifecycle {
  public currentState: RuntimeState = 'Registered';
  public id: string;

  constructor(id: string) {
    this.id = id;
  }

  protected transition(to: RuntimeState) {
    // In a real implementation, you'd validate state transitions here
    this.currentState = to;
  }

  async initialize(): Promise<void> {
    if (this.currentState !== 'Registered') throw new Error('Invalid state transition');
    this.transition('Initialized');
  }

  async start(): Promise<void> {
    if (this.currentState !== 'Initialized' && this.currentState !== 'Paused') throw new Error('Invalid state transition');
    this.transition('Running');
  }

  async pause(): Promise<void> {
    if (this.currentState !== 'Running') throw new Error('Invalid state transition');
    this.transition('Paused');
  }

  async stop(): Promise<void> {
    if (this.currentState !== 'Running' && this.currentState !== 'Paused') throw new Error('Invalid state transition');
    this.transition('Stopped');
  }

  async dispose(): Promise<void> {
    this.transition('Disposed');
  }
}

export class RuntimeRegistry {
  private objects: Map<string, RuntimeLifecycle> = new Map();

  register(id: string, obj: RuntimeLifecycle) {
    if (this.objects.has(id)) {
      throw new Error(`Runtime object already registered: ${id}`);
    }
    this.objects.set(id, obj);
  }

  get(id: string): RuntimeLifecycle | undefined {
    return this.objects.get(id);
  }

  async stopAll(): Promise<void> {
    for (const [id, obj] of this.objects.entries()) {
      if (obj.currentState === 'Running' || obj.currentState === 'Paused') {
        await obj.stop();
        await obj.dispose();
      }
    }
  }
}
