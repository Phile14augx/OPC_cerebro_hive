import { Injectable } from '@nestjs/common';
import { RerankDto, RerankResponseDto, RerankResultItemDto } from '../dto/rerank.dto';

@Injectable()
export class RerankingService {
  private tokenize(text: string): string[] {
    if (!text) return [];
    return text.toLowerCase().split(/\W+/).filter(t => t.length > 0);
  }

  async rerankCandidates(dto: RerankDto): Promise<RerankResponseDto> {
    const queryTerms = this.tokenize(dto.query_text);
    if (queryTerms.length === 0) {
      return {
        results: dto.candidates
          .slice(0, dto.top_n)
          .map(c => ({ id: c.id, relevance_score: 0 }))
      };
    }

    const queryTermSet = new Set(queryTerms);
    const results: RerankResultItemDto[] = [];

    for (const candidate of dto.candidates) {
      const candidateTerms = this.tokenize(candidate.text);
      let matchCount = 0;
      for (const term of candidateTerms) {
        if (queryTermSet.has(term)) {
          matchCount++;
        }
      }
      
      const relevance_score = matchCount / queryTerms.length;
      results.push({
        id: candidate.id,
        relevance_score
      });
    }

    results.sort((a, b) => b.relevance_score - a.relevance_score);
    return { results: results.slice(0, dto.top_n) };
  }
}
