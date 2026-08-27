import { Module } from '@nestjs/common';
import { KubernetesExecutionService } from './kubernetes-execution.service';
import { PipelineService } from './pipeline.service';

@Module({
  providers: [KubernetesExecutionService, PipelineService],
  exports: [KubernetesExecutionService, PipelineService],
})
export class ExecutionModule {}
