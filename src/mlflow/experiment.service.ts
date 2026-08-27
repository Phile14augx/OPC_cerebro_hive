import { Injectable, NotFoundException } from '@nestjs/common';

export interface Experiment {
  id: string;
  name: string;
}

export interface Run {
  id: string;
  experimentId: string;
  params: Record<string, string>;
  metrics: Record<string, number>;
  tags: Record<string, string>;
  status: string;
}

@Injectable()
export class ExperimentService {
  private experiments: Map<string, Experiment> = new Map();
  private runs: Map<string, Run> = new Map();
  private nextExpId = 1;
  private nextRunId = 1;

  createExperiment(name: string): Experiment {
    const exp: Experiment = { id: (this.nextExpId++).toString(), name };
    this.experiments.set(exp.id, exp);
    return exp;
  }

  getExperiment(id: string): Experiment {
    const exp = this.experiments.get(id);
    if (!exp) throw new NotFoundException('Experiment not found');
    return exp;
  }

  createRun(experimentId: string): Run {
    this.getExperiment(experimentId);
    const run: Run = {
      id: (this.nextRunId++).toString(),
      experimentId,
      params: {},
      metrics: {},
      tags: {},
      status: 'RUNNING'
    };
    this.runs.set(run.id, run);
    return run;
  }

  getRun(id: string): Run {
    const run = this.runs.get(id);
    if (!run) throw new NotFoundException('Run not found');
    return run;
  }

  logParameter(runId: string, key: string, value: string): void {
    const run = this.getRun(runId);
    run.params[key] = value;
  }

  logMetric(runId: string, key: string, value: number): void {
    const run = this.getRun(runId);
    run.metrics[key] = value;
  }

  logTag(runId: string, key: string, value: string): void {
    const run = this.getRun(runId);
    run.tags[key] = value;
  }

  updateRunStatus(runId: string, status: string, tags: Record<string, string> = {}): Run {
    const run = this.getRun(runId);
    run.status = status;
    Object.assign(run.tags, tags);
    return run;
  }

  listRuns(experimentId: string, filterByTagKey?: string, filterByTagValue?: string): Run[] {
    let result = Array.from(this.runs.values()).filter(r => r.experimentId === experimentId);
    if (filterByTagKey && filterByTagValue) {
      result = result.filter(r => r.tags[filterByTagKey] === filterByTagValue);
    }
    return result;
  }
}
