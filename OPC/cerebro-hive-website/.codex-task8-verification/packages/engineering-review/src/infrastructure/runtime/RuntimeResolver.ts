import { ISandboxRuntime } from './ISandboxRuntime';
import { IAnalyzerCapability } from '../analyzers/models';

export class RuntimeResolver {
  private readonly availableRuntimes: ISandboxRuntime[] = [];

  register(runtime: ISandboxRuntime): void {
    this.availableRuntimes.push(runtime);
  }

  resolve(analyzerCapability: IAnalyzerCapability): ISandboxRuntime {
    // For M26.7 stubbing, just return the first available that matches capabilities
    // Future: more complex matching based on `analyzerCapability.resourceRequirements` vs `runtime.capabilities`
    if (this.availableRuntimes.length === 0) {
      throw new Error('No sandbox runtimes registered.');
    }
    return this.availableRuntimes[0];
  }
}
