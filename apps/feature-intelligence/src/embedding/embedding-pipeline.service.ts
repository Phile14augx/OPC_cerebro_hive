import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingPipelineService {
  private processedEmbeddings: Record<string, any[]> = {};

  async processEmbeddings(tenantId: string, data: any): Promise<any> {
    if (!tenantId) {
      throw new Error('Tenant ID is required for embedding processing');
    }

    if (!data || !data.items || data.items.length === 0) {
      throw new Error('Input data items cannot be empty');
    }

    if (!this.processedEmbeddings[tenantId]) {
      this.processedEmbeddings[tenantId] = [];
    }

    try {
      const processed = data.items.map((item: any) => {
        if (item.id === 'fail') throw new Error('Simulated embedding generation failure');
        return {
          id: item.id,
          vector: [Math.random(), Math.random(), Math.random()],
          model: data.model || 'default-model',
        };
      });

      this.processedEmbeddings[tenantId].push(...processed);

      return {
        status: 'processed',
        processed_count: processed.length,
        items: processed
      };
    } catch (e) {
      const err = e as Error;
      throw new Error(`Embedding dependency failed: ${err.message}`);
    }
  }
}
