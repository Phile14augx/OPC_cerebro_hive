import { Module } from '@nestjs/common';
import { KubernetesExecutionService } from './kubernetes-execution.service';

@Module({
  providers: [KubernetesExecutionService],
  exports: [KubernetesExecutionService],
})
export class ExecutionModule {}
