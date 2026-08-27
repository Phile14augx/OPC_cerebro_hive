import { Module } from '@nestjs/common';
import { MlflowModule } from '../mlflow/mlflow.module';
import { KubernetesExecutionService } from './kubernetes-execution.service';
import { ModelDeploymentService } from './model-deployment.service';
import { PipelineService } from './pipeline.service';

@Module({
  imports: [MlflowModule],
  providers: [KubernetesExecutionService, PipelineService, ModelDeploymentService],
  exports: [KubernetesExecutionService, PipelineService, ModelDeploymentService],
})
export class ExecutionModule {}
