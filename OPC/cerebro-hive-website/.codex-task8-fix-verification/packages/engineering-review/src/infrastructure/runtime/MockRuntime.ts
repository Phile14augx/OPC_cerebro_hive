import { ISandboxRuntime, SandboxSession, ILogStream } from './ISandboxRuntime';
import { ExecutionContext, SandboxExecutionResult, RuntimeCapability } from './models';
import { SandboxStateMachine } from './SandboxStateMachine';

export class MockRuntime implements ISandboxRuntime {
  readonly capabilities: RuntimeCapability = {
    supportsContainers: true,
    supportsMicroVMs: false,
    supportsTmpfs: true,
    supportsNetworkIsolation: true,
    supportsCgroups: true,
    supportsSnapshots: false,
    supportsGPU: false
  };

  createSession(context: ExecutionContext): SandboxSession {
    return new MockSession(context);
  }
}

class MockSession implements SandboxSession {
  readonly sessionId = `mock-${Date.now()}`;
  private stateMachine = new SandboxStateMachine();

  constructor(public readonly context: ExecutionContext) {}

  getLogStream(): ILogStream {
    return {
      onData: (cb) => { cb('Mock log output'); },
      onError: (cb) => { }
    };
  }

  async start(): Promise<void> {
    this.stateMachine.transitionTo('Provisioning');
    this.stateMachine.transitionTo('SandboxCreated');
    this.stateMachine.transitionTo('ArtifactsMounted');
    this.stateMachine.transitionTo('Running');
  }

  async wait(): Promise<SandboxExecutionResult> {
    this.stateMachine.transitionTo('CollectingOutput');
    this.stateMachine.transitionTo('Completed');
    this.stateMachine.transitionTo('CleaningUp');
    this.stateMachine.transitionTo('Finished');

    return {
      metadata: {
        runtimeId: 'mock-engine',
        runtimeType: 'MockRuntime',
        runtimeVersion: '1.0.0',
        sandboxId: this.sessionId,
        startTime: Date.now(),
        endTime: Date.now(),
        securityProfile: this.context.securityProfile,
        cleanupReport: {
          processTerminated: true,
          artifactsUnmounted: true,
          scratchDeleted: true,
          sandboxDestroyed: true,
          locksReleased: true,
          durationMs: 5
        }
      },
      exitCode: 0,
      requestedResources: this.context.limits,
      enforcedResources: this.context.limits,
      actualResources: this.context.limits,
      rawOutputSize: 100
    };
  }
}
