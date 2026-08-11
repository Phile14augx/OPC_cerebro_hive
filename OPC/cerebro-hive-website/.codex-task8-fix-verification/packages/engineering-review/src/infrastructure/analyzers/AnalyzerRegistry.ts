import { IAnalyzerCapability } from './models';

export class AnalyzerRegistry {
  private readonly capabilities = new Map<string, IAnalyzerCapability>();

  register(capability: IAnalyzerCapability): void {
    if (this.capabilities.has(capability.analyzerId)) {
      throw new Error(`Analyzer ${capability.analyzerId} is already registered.`);
    }
    this.capabilities.set(capability.analyzerId, capability);
  }

  getCapability(analyzerId: string): IAnalyzerCapability | undefined {
    return this.capabilities.get(analyzerId);
  }

  getEnabled(): readonly IAnalyzerCapability[] {
    return Array.from(this.capabilities.values());
  }
}
