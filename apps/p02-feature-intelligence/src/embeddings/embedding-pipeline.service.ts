import { Injectable } from '@nestjs/common';

export interface EmbeddingPipeline {
  generateEmbedding(data: any): number[];
}

@Injectable()
export class EmbeddingPipelineService implements EmbeddingPipeline {
  generateEmbedding(data: any): number[] {
    // Mock implementation for L2 scaffold
    return [0.1, 0.2, 0.3];
  }
}
