import { AnalyzerExecutionRequest, AnalyzerResult } from '../infrastructure/analyzers/models';

/**
 * M26.6 Integration Contract for External Analyzers
 *
 * Adapters never provide their own isolation. Isolation is a responsibility of the execution runtime.
 * The adapter's sole responsibility is wrapping the third-party tool execution (invoke, parse, normalize).
 */
export interface IAnalyzerAdapter {
  /**
   * The unique identifier for this analyzer type (e.g. 'semgrep', 'checkov').
   */
  readonly analyzerId: string;

  /**
   * Dispatches the execution request to the external tool.
   * Adapters must honor the context, limits, and mapped artifact references provided by the runtime.
   */
  execute(request: AnalyzerExecutionRequest): Promise<AnalyzerResult>;
}
