import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

export interface EvalRunConfig {
  taskType: string;
  datasetRef: string;
  metrics: string[];
  judgeConfig?: any;
}

export interface MetricResult {
  accuracy: number;
  precision: number;
  recall: number;
}

export type EvaluationLifecycleState =
  | 'REGISTERED'
  | 'AUTHORIZED'
  | 'INFERENCE_COMPLETED'
  | 'EVALUATED'
  | 'BENCHMARKED'
  | 'COMPLETED'
  | 'FAILED';

export interface EvaluationFailure {
  stage: string;
  code: string;
  message: string;
}

export interface BenchmarkOutcome {
  pass: boolean;
  reason: string;
}

export interface EvalResult {
  evaluation_id: string;
  config: EvalRunConfig;
  status: EvaluationLifecycleState;
  tenantId?: string;
  traceId?: string;
  inferenceOutputs?: string[];
  metrics?: Record<string, number>;
  benchmark?: BenchmarkOutcome;
  failure?: EvaluationFailure;
  shadowOf?: string;
}

@Injectable()
export class EvaluationService {
  private runs: Map<string, EvalResult> = new Map();

  private clone(run: EvalResult): EvalResult {
    return structuredClone ? structuredClone(run) : JSON.parse(JSON.stringify(run));
  }

  private assertState(run: EvalResult, expected: EvaluationLifecycleState) {
    if (run.status !== expected) {
      throw new ConflictException(`Invalid state transition: ${run.status} -> ... Expected ${expected}`);
    }
  }

  createEvalRun(config: EvalRunConfig): EvalResult {
    const evaluation_id = 'ev_' + Math.random().toString(36).substring(7);
    const result: EvalResult = {
      evaluation_id,
      config,
      status: 'REGISTERED',
    };
    this.runs.set(evaluation_id, this.clone(result));
    return this.clone(result);
  }

  createShadowRun(primaryEvaluationId: string, config: EvalRunConfig): EvalResult {
    const evaluation_id = 'ev_' + Math.random().toString(36).substring(7);
    const result: EvalResult = {
      evaluation_id,
      config,
      status: 'REGISTERED',
      shadowOf: primaryEvaluationId,
    };
    this.runs.set(evaluation_id, this.clone(result));
    return this.clone(result);
  }

  authorizeEvalRun(evaluation_id: string, tenantId: string, traceId: string): EvalResult {
    const run = this.runs.get(evaluation_id);
    if (!run) throw new NotFoundException();
    this.assertState(run, 'REGISTERED');
    
    run.status = 'AUTHORIZED';
    run.tenantId = tenantId;
    run.traceId = traceId;
    return this.clone(run);
  }

  recordInferenceCompleted(evaluation_id: string, outputs: string[]): EvalResult {
    const run = this.runs.get(evaluation_id);
    if (!run) throw new NotFoundException();
    this.assertState(run, 'AUTHORIZED');
    
    run.status = 'INFERENCE_COMPLETED';
    run.inferenceOutputs = outputs;
    return this.clone(run);
  }

  recordEvaluation(evaluation_id: string, metrics: Record<string, number>): EvalResult {
    const run = this.runs.get(evaluation_id);
    if (!run) throw new NotFoundException();
    this.assertState(run, 'INFERENCE_COMPLETED');
    
    run.status = 'EVALUATED';
    run.metrics = metrics;
    return this.clone(run);
  }

  recordBenchmark(evaluation_id: string, benchmark: BenchmarkOutcome): EvalResult {
    const run = this.runs.get(evaluation_id);
    if (!run) throw new NotFoundException();
    this.assertState(run, 'EVALUATED');
    
    run.status = 'BENCHMARKED';
    run.benchmark = benchmark;
    return this.clone(run);
  }

  completeEvalRun(evaluation_id: string): EvalResult {
    const run = this.runs.get(evaluation_id);
    if (!run) throw new NotFoundException();
    
    if (run.status === 'COMPLETED' || run.status === 'FAILED') {
      return this.clone(run);
    }
    
    this.assertState(run, 'BENCHMARKED');
    run.status = 'COMPLETED';
    return this.clone(run);
  }

  failEvalRun(evaluation_id: string, currentStage: string, error: any): EvalResult {
    const run = this.runs.get(evaluation_id);
    if (!run) throw new NotFoundException();
    
    if (run.status === 'COMPLETED' || run.status === 'FAILED') {
      return this.clone(run);
    }
    
    run.status = 'FAILED';
    run.failure = {
      stage: currentStage,
      code: error?.name || 'Error',
      message: error?.message || 'Unknown error'
    };
    return this.clone(run);
  }

  executeMetricComputation(predictions: string[], groundTruth: string[]): MetricResult {
    if (predictions.length !== groundTruth.length || predictions.length === 0) {
      return { accuracy: 0, precision: 0, recall: 0 };
    }

    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let correct = 0;

    for (let i = 0; i < predictions.length; i++) {
      const p = predictions[i].toLowerCase() === 'true';
      const g = groundTruth[i].toLowerCase() === 'true';

      if (p === g) {
        correct++;
      }

      if (p && g) {
        truePositives++;
      } else if (p && !g) {
        falsePositives++;
      } else if (!p && g) {
        falseNegatives++;
      }
    }

    const accuracy = correct / predictions.length;
    const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;

    return { accuracy, precision, recall };
  }

  findOne(id: string): EvalResult {
    const run = this.runs.get(id);
    if (!run) throw new NotFoundException();
    return this.clone(run);
  }

  create(evalDto: any) {
    const run = this.createEvalRun({
      taskType: evalDto?.target?.type || 'MODEL',
      datasetRef: evalDto?.dataset_ids?.[0] || 'default-ds',
      metrics: evalDto?.metrics?.map((m: any) => m.name) || [],
    });
    return {
      evaluation_id: run.evaluation_id,
      status: 'QUEUED', // Required by external contract for now? Wait, spec says nothing about create(), keep it for backwards compatibility if any
    };
  }
}
