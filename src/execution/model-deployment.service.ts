import { Injectable } from '@nestjs/common';
import { ExperimentService } from '../mlflow/experiment.service';
import { ModelStage } from '../mlflow/model-registry.service';
import {
  KubernetesExecutionService,
  PipelineExecutionSubmission,
} from './kubernetes-execution.service';
import { PipelineDefinition, PipelineService } from './pipeline.service';

export interface ModelStageTransitionEvent {
  modelName: string;
  version: number;
  runId: string;
  stage: ModelStage;
  pipeline: PipelineDefinition;
}

export interface ModelDeploymentResult extends PipelineExecutionSubmission {
  executionOrder: string[];
}

@Injectable()
export class ModelDeploymentService {
  constructor(
    private readonly pipelines: PipelineService,
    private readonly executions: KubernetesExecutionService,
    private readonly experiments: ExperimentService,
  ) {}

  async handleModelStageTransition(
    event: ModelStageTransitionEvent,
  ): Promise<ModelDeploymentResult | null> {
    if (event.stage !== 'Production') {
      return null;
    }

    try {
      this.pipelines.validateDAG(event.pipeline);
      const executionOrder = await this.pipelines.executePipeline(event.pipeline);
      const submission = this.executions.executePipeline({
        modelName: event.modelName,
        modelVersion: event.version,
        runId: event.runId,
        executionOrder,
      });

      this.experiments.updateRunStatus(event.runId, submission.status, {
        'deployment.execution_id': submission.executionId,
        'deployment.model': event.modelName,
        'deployment.model_version': event.version.toString(),
      });

      return { ...submission, executionOrder };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.experiments.updateRunStatus(event.runId, 'FAILED', {
        'deployment.error': message,
      });
      throw error;
    }
  }
}
