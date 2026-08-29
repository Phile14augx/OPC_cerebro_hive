import { Injectable, NotFoundException } from '@nestjs/common';

export interface BenchmarkThreshold {
  metric: string;
  operator: '>' | '<' | '>=' | '<=';
  value: number;
}

export interface BenchmarkSuite {
  id: string;
  name: string;
  taskType: string;
  dataset: string;
  metrics: string[];
  thresholds: BenchmarkThreshold[];
}

export interface EvalResult {
  metrics: Record<string, number>;
}

@Injectable()
export class BenchmarkRegistryService {
  private benchmarks: Map<string, BenchmarkSuite> = new Map();

  registerBenchmarkSuite(
    name: string,
    taskType: string,
    dataset: string,
    metrics: string[],
    thresholds: BenchmarkThreshold[],
  ): BenchmarkSuite {
    const id = 'bench_' + Math.random().toString(36).substring(7);
    const suite: BenchmarkSuite = { id, name, taskType, dataset, metrics, thresholds };
    this.benchmarks.set(id, suite);
    return suite;
  }

  getBenchmarkById(id: string): BenchmarkSuite {
    const suite = this.benchmarks.get(id);
    if (!suite) {
      throw new NotFoundException(`Benchmark ${id} not found`);
    }
    return suite;
  }

  listBenchmarks(): BenchmarkSuite[] {
    return Array.from(this.benchmarks.values());
  }

  validateEvalResult(evalResult: EvalResult, benchmarkId: string): { passed: boolean; failures: string[] } {
    const suite = this.getBenchmarkById(benchmarkId);
    const failures: string[] = [];

    for (const threshold of suite.thresholds) {
      const val = evalResult.metrics[threshold.metric];
      if (val === undefined) {
        failures.push(`Metric ${threshold.metric} missing from evaluation result`);
        continue;
      }

      let pass = false;
      switch (threshold.operator) {
        case '>': pass = val > threshold.value; break;
        case '<': pass = val < threshold.value; break;
        case '>=': pass = val >= threshold.value; break;
        case '<=': pass = val <= threshold.value; break;
      }

      if (!pass) {
        failures.push(`Metric ${threshold.metric} (${val}) failed threshold ${threshold.operator} ${threshold.value}`);
      }
    }

    return { passed: failures.length === 0, failures };
  }
}
