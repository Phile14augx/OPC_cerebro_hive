import { Injectable } from '@nestjs/common';
import { HybridSearchDto, SearchResponseDto } from '../dto/hybrid-search.dto';

@Injectable()
export class HybridRetrievalService {
  async search(dto: HybridSearchDto): Promise<SearchResponseDto> {
    // Stub implementation for dense + sparse BM25 fusion
    // and RRF reranking
    return { results: [] };
  }
}
