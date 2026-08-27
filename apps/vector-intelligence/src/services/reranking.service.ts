import { Injectable } from '@nestjs/common';
import { RerankDto, RerankResponseDto, RerankResultItemDto } from '../dto/rerank.dto';

@Injectable()
export class RerankingService {
  private tokenize(text: string): string[] {
    if (!text) return [];
    return text.toLowerCase().split(/\W+/).filter(t => t.length > 0);
  }

  async rerankCandidates(dto: RerankDto): Promise<RerankResponseDto> {
    const queryTerms = Array.from(new Set(this.tokenize(dto.query_text)));
    if (queryTerms.length === 0) {
      return {
        results: dto.candidates
          .slice(0, dto.top_n)
          .map(c => ({ id: c.id, relevance_score: 0 }))
      };
    }

    const rankedResults: Array<{
      result: RerankResultItemDto;
      exactMatch: boolean;
      precision: number;
      inputOrder: number;
    }> = [];

    dto.candidates.forEach((candidate, inputOrder) => {
      const candidateTerms = Array.from(new Set(this.tokenize(candidate.text)));
      const matchCount = queryTerms.filter(term => candidateTerms.includes(term)).length;
      const relevance_score = matchCount / queryTerms.length;
      rankedResults.push({
        result: { id: candidate.id, relevance_score },
        exactMatch:
          candidateTerms.length === queryTerms.length &&
          candidateTerms.every((term, index) => term === queryTerms[index]),
        precision: candidateTerms.length === 0 ? 0 : matchCount / candidateTerms.length,
        inputOrder
      });
    });

    rankedResults.sort((a, b) =>
      b.result.relevance_score - a.result.relevance_score ||
      Number(b.exactMatch) - Number(a.exactMatch) ||
      b.precision - a.precision ||
      a.inputOrder - b.inputOrder
    );

    return {
      results: rankedResults.slice(0, dto.top_n).map(({ result }) => result)
    };
  }
}
