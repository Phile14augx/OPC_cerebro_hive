import { Injectable } from '@nestjs/common';
import { RerankDto, RerankResponseDto } from '../dto/rerank.dto';

@Injectable()
export class RerankingService {
  async rerankCandidates(dto: RerankDto): Promise<RerankResponseDto> {
    // Stub implementation for cross-encoder reranking
    return { results: [] };
  }
}
