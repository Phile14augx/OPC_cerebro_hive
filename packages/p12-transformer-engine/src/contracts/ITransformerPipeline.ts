import { TransformerContext } from './ITransformer';

/**
 * A single step in a pipeline – a transformer name and optional input override.
 */
export interface PipelineStep {
  /** The registered name of the transformer to invoke. */
  transformerName: string;
  /**
   * Extra metadata merged into the TransformerContext for this step only.
   */
  stepMetadata?: Record<string, unknown>;
}

/**
 * Defines an ordered sequence of transformer steps.
 * The output of step N is fed as input to step N+1.
 */
export interface TransformerPipeline {
  readonly name: string;
  readonly steps: ReadonlyArray<PipelineStep>;
}

/** Result emitted per step during pipeline execution. */
export interface PipelineStepResult<TOutput = unknown> {
  step: number;
  transformerName: string;
  output: TOutput;
  durationMs: number;
}

/** Aggregate result of running a full pipeline. */
export interface PipelineResult<TFinal = unknown> {
  pipelineName: string;
  stepResults: PipelineStepResult[];
  finalOutput: TFinal;
  totalDurationMs: number;
  context: TransformerContext;
}
