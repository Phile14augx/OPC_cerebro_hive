// @ts-nocheck
import { IStreamingProvider } from "./providers/interfaces";
import { MockStreamingProvider } from "./providers/MockProviders";

const streamingProvider: IStreamingProvider = new MockStreamingProvider();

export class ExecutionService {
  async submitExecution(): Promise<never> {
    throw new Error(
      "TALENT_EXECUTION_NOT_IMPLEMENTED: candidate code is not executed. Assessment and execution tables were dropped from the platform schema."
    );
  }

  getStreamingProvider(): IStreamingProvider {
    return streamingProvider;
  }
}
