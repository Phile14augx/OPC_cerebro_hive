import { Injectable, ForbiddenException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { EvaluationService, EvalResult } from '../evaluations/evaluation.service';
import { BenchmarkRegistryService } from '../benchmarks/benchmark.service';
import { AdversarialService } from '../adversarial/adversarial.service';
import {
  RunEvaluationRequest,
  EvaluationContext,
  ModelInferencePort,
  AuthorizationPort,
  MLOpsEvaluationPort,
  ObservabilityPort,
} from './evaluation-layer.contracts';

@Injectable()
export class EvaluationLayerHarness {
  constructor(
    private evaluations: EvaluationService,
    private benchmarks: BenchmarkRegistryService,
    private adversarial: AdversarialService,
    private inferencePort: ModelInferencePort,
    private authPort: AuthorizationPort,
    private mlOpsPort: MLOpsEvaluationPort,
    private observability: ObservabilityPort,
  ) {}

  async run(request: RunEvaluationRequest, context: EvaluationContext): Promise<EvalResult> {
    if (!context.tenantId || !context.subjectId) {
      throw new BadRequestException('Blank identity not allowed');
    }
    if (!request.dataset.inputs.length || !request.dataset.expected.length) {
      throw new BadRequestException('Empty inputs or expected outputs');
    }
    const supportedMetrics = ['accuracy', 'precision', 'recall'];
    for (const m of request.metrics) {
      if (!supportedMetrics.includes(m)) {
        throw new BadRequestException(`Unsupported metric: ${m}`);
      }
    }

    const run = this.evaluations.createEvalRun({
      taskType: 'MODEL',
      datasetRef: request.dataset.id,
      metrics: [...request.metrics],
    });
    const id = run.evaluation_id;

    try {
      if (request.dataset.tenantId !== context.tenantId) {
        throw new ForbiddenException('Tenant mismatch');
      }

      const authorized = await this.authPort.authorize(context, 'evaluation:run');
      if (!authorized) {
        throw new ForbiddenException('Unauthorized');
      }

      this.evaluations.authorizeEvalRun(id, context.tenantId, context.traceId);

      for (const input of request.dataset.inputs) {
        const scan = this.adversarial.scanForInjection(input);
        if (scan.flagged) {
          throw new UnprocessableEntityException('Unsafe input detected');
        }
      }

      const inferenceRes = await this.inferencePort.infer({
        targetId: request.targetId,
        inputs: request.dataset.inputs,
        context: context,
      });

      if (inferenceRes.outputs.length !== request.dataset.expected.length) {
        throw new UnprocessableEntityException('Output cardinality mismatch');
      }

      this.evaluations.recordInferenceCompleted(id, [...inferenceRes.outputs]);

      const metricResult = this.evaluations.executeMetricComputation(
        [...inferenceRes.outputs],
        [...request.dataset.expected]
      );
      this.evaluations.recordEvaluation(id, metricResult as any);

      const benchmarkResult = this.benchmarks.validateEvalResult(
        { metrics: metricResult as any },
        request.benchmarkId
      );
      this.evaluations.recordBenchmark(id, {
        pass: benchmarkResult.passed,
        reason: benchmarkResult.failures.join(', '),
      });

      await this.mlOpsPort.publishOutcome(
        id,
        benchmarkResult.passed ? 'PASS' : 'FAIL',
        metricResult
      );

      const completed = this.evaluations.completeEvalRun(id);
      
      try {
        await this.observability.publish({ type: 'EVALUATION_COMPLETED', id, context });
      } catch (e) { /* ignore telemetry failures */ }

      return completed;
    } catch (error: any) {
      const failed = this.evaluations.failEvalRun(id, this.evaluations.findOne(id).status, error);
      try {
        await this.observability.publish({ type: 'EVALUATION_FAILED', id, context, cause: error });
      } catch (e) { /* ignore telemetry failures */ }
      throw error;
    }
  }

  async runShadowEvaluation(primaryEvaluationId: string, request: RunEvaluationRequest, context: EvaluationContext): Promise<EvalResult> {
    const primary = this.evaluations.findOne(primaryEvaluationId);
    
    // validate
    if (!context.tenantId || !context.subjectId) throw new BadRequestException('Blank identity not allowed');
    if (!request.dataset.inputs.length || !request.dataset.expected.length) throw new BadRequestException('Empty inputs or expected outputs');

    const run = this.evaluations.createShadowRun(primaryEvaluationId, {
      taskType: 'MODEL',
      datasetRef: request.dataset.id,
      metrics: [...request.metrics],
    });
    const id = run.evaluation_id;

    try {
      if (request.dataset.tenantId !== context.tenantId) throw new ForbiddenException('Tenant mismatch');
      
      const authorized = await this.authPort.authorize(context, 'evaluation:run');
      if (!authorized) throw new ForbiddenException('Unauthorized');
      
      this.evaluations.authorizeEvalRun(id, context.tenantId, context.traceId);
      
      for (const input of request.dataset.inputs) {
        if (this.adversarial.scanForInjection(input).flagged) {
          throw new UnprocessableEntityException('Unsafe input detected');
        }
      }
      
      const inferenceRes = await this.inferencePort.infer({
        targetId: request.targetId,
        inputs: request.dataset.inputs,
        context: context,
      });
      
      if (inferenceRes.outputs.length !== request.dataset.expected.length) throw new UnprocessableEntityException('Output cardinality mismatch');
      
      this.evaluations.recordInferenceCompleted(id, [...inferenceRes.outputs]);
      
      const metricResult = this.evaluations.executeMetricComputation([...inferenceRes.outputs], [...request.dataset.expected]);
      this.evaluations.recordEvaluation(id, metricResult as any);
      
      const benchmarkResult = this.benchmarks.validateEvalResult({ metrics: metricResult as any }, request.benchmarkId);
      this.evaluations.recordBenchmark(id, { pass: benchmarkResult.passed, reason: benchmarkResult.failures.join(', ') });
      
      await this.mlOpsPort.publishOutcome(id, benchmarkResult.passed ? 'PASS' : 'FAIL', metricResult);
      
      const completed = this.evaluations.completeEvalRun(id);
      
      try {
        await this.observability.publish({ type: 'EVALUATION_COMPLETED', id, context });
      } catch (e) { /* ignore telemetry failures */ }
      
      return completed;
    } catch (error: any) {
      const failed = this.evaluations.failEvalRun(id, this.evaluations.findOne(id).status, error);
      try {
        await this.observability.publish({ type: 'EVALUATION_FAILED', id, context, cause: error });
      } catch (e) {
        // ignore telemetry failures
      }
      throw error; // Rethrow EXACT SAME error reference
    }
  }
}
