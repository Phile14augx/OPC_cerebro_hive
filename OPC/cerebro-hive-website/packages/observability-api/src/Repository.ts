import { Trace } from './Types';
export class ObservabilityRepository {
  async getRecentTraces(): Promise<Trace[]> {
    return [{ traceId: 'trace-abc', rootSpan: 'LLM.Generate', durationMs: 1450, error: false }, { traceId: 'trace-xyz', rootSpan: 'RAG.Retrieve', durationMs: 420, error: true }];
  }
}