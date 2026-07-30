import { ISandboxRuntime, SandboxSession, ILogStream } from './ISandboxRuntime';
import { ExecutionContext, SandboxExecutionResult, RuntimeCapability } from './models';
import { SandboxStateMachine } from './SandboxStateMachine';

export class LocalProcessRuntime implements ISandboxRuntime {
  readonly capabilities: RuntimeCapability = {
    supportsContainers: false,
    supportsMicroVMs: false,
    supportsTmpfs: true,
    supportsNetworkIsolation: false, // OS limitations
    supportsCgroups: false,
    supportsSnapshots: false,
    supportsGPU: false
  };

  createSession(context: ExecutionContext): SandboxSession {
    return new LocalProcessSession(context);
  }
}

class LocalProcessSession implements SandboxSession {
  readonly sessionId = `local-${Date.now()}`;
  private stateMachine = new SandboxStateMachine();

  constructor(public readonly context: ExecutionContext) {}

  getLogStream(): ILogStream {
    return {
      onData: (cb) => { /* mock */ },
      onError: (cb) => { /* mock */ }
    };
  }

  async start(): Promise<void> {
    this.stateMachine.transitionTo('Provisioning');
    this.stateMachine.transitionTo('SandboxCreated');
    this.stateMachine.transitionTo('ArtifactsMounted');
    this.stateMachine.transitionTo('Running');
  }

  async wait(): Promise<SandboxExecutionResult> {
    try {
      this.stateMachine.transitionTo('CollectingOutput');
      this.stateMachine.transitionTo('Completed');
    } finally {
      this.stateMachine.transitionTo('CleaningUp');
      // Simulate deterministic cleanup
      this.stateMachine.transitionTo('Finished');
    }

    return {
      metadata: {
        runtimeId: 'local-process',
        runtimeType: 'LocalProcessRuntime',
        runtimeVersion: '1.0.0',
        sandboxId: this.sessionId,
        startTime: Date.now() - 500,
        endTime: Date.now(),
        securityProfile: this.context.securityProfile,
        cleanupReport: {
          processTerminated: true,
          artifactsUnmounted: true,
          scratchDeleted: true,
          sandboxDestroyed: true,
          locksReleased: true,
          durationMs: 45
        }
      },
      exitCode: 0,
      requestedResources: this.context.limits,
      enforcedResources: this.context.limits,
      actualResources: { cpuUnits: 0.1, memoryMb: 128, timeoutSeconds: 1 },
      rawOutputSize: 1024
    };
  }
}
