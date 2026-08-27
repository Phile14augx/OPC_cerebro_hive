import { Injectable } from '@nestjs/common';

export interface PipelineExecutionRequest {
  modelName: string;
  modelVersion: number;
  runId: string;
  executionOrder: string[];
}

export interface PipelineExecutionSubmission {
  executionId: string;
  status: 'SUBMITTED';
}

@Injectable()
export class KubernetesExecutionService {
  private nextExecutionId = 1;
  private readonly submittedExecutions = new Map<string, PipelineExecutionRequest>();

  executePipeline(request: PipelineExecutionRequest): PipelineExecutionSubmission {
    const sequence = this.nextExecutionId++;
    const executionId = `model-deployment-${sequence.toString().padStart(4, '0')}`;
    this.submittedExecutions.set(executionId, request);
    return {
      executionId,
      status: 'SUBMITTED',
    };
  }
}
