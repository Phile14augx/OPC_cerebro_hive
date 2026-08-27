import { Injectable, NotFoundException } from '@nestjs/common';

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

export interface EvalResult {
  evaluation_id: string;
  config: EvalRunConfig;
  status: string;
  metrics: Record<string, number>;
}

@Injectable()
export class EvaluationService {
  private runs: Map<string, EvalResult> = new Map();

  createEvalRun(config: EvalRunConfig): EvalResult {
    const evaluation_id = 'ev_' + Math.random().toString(36).substring(7);
    const result: EvalResult = {
      evaluation_id,
      config,
      status: 'CREATED',
      metrics: {},
    };
    this.runs.set(evaluation_id, result);
    return result;
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

  completeEvalRun(evaluation_id: string, metrics: Record<string, number>): EvalResult {
    const run = this.runs.get(evaluation_id);
    if (!run) {
      throw new NotFoundException(`Evaluation ${evaluation_id} not found`);
    }
    run.status = 'COMPLETED';
    run.metrics = metrics;
    return run;
  }

  findOne(id: string): EvalResult {
    const run = this.runs.get(id);
    if (!run) {
      throw new NotFoundException(`Evaluation ${id} not found`);
    }
    return run;
  }

  create(evalDto: any) {
    const run = this.createEvalRun({
      taskType: evalDto?.target?.type || 'MODEL',
      datasetRef: evalDto?.dataset_ids?.[0] || 'default-ds',
      metrics: evalDto?.metrics?.map((m: any) => m.name) || [],
    });
    return {
      evaluation_id: run.evaluation_id,
      status: 'QUEUED',
    };
  }
}
