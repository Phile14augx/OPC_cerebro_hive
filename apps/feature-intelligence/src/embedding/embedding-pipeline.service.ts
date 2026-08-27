import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingPipelineService {
  async processEmbeddings(data: any): Promise<any> {
    // Stub
    return { status: 'processed', input: data };
  }
}
