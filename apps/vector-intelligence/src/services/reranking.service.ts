import { Injectable } from '@nestjs/common';
import { RerankDto, RerankResponseDto, RerankResultItemDto } from '../dto/rerank.dto';
import { InputValidationError, validateId, validateLimit, validateVector } from '../validation';

@Injectable()
export class RerankingService {
  private tokenize(text: string): string[] {
    if (!text) return [];
    return text.toLowerCase().split(/\W+/).filter(t => t.length > 0);
  }

  private cosineSimilarity(left: number[], right: number[]): number {
    if (left.length !== right.length) throw new InputValidationError('reranking vector dimensions must match');
    const dot = left.reduce((sum, value, index) => sum + value * right[index], 0);
    const leftNorm = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0));
    const rightNorm = Math.sqrt(right.reduce((sum, value) => sum + value * value, 0));
    return leftNorm === 0 || rightNorm === 0 ? 0 : dot / (leftNorm * rightNorm);
  }

  async rerankCandidates(dto: RerankDto): Promise<RerankResponseDto> {
    validateLimit(dto.top_n, 'top_n');
    if (typeof dto.query_text !== 'string') throw new InputValidationError('query_text must be a string');
    if (!Array.isArray(dto.candidates)) throw new InputValidationError('candidates must be an array');
    dto.candidates.forEach((candidate) => {
      validateId(candidate.id, 'candidate id');
      if (typeof candidate.text !== 'string') throw new InputValidationError('candidate text must be a string');
      if (candidate.vector) validateVector(candidate.vector, 'candidate reranking vector');
    });
    if (dto.query_vector) validateVector(dto.query_vector, 'query reranking vector');
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
      const lexicalScore = matchCount / queryTerms.length;
      const semanticScore = dto.query_vector && candidate.vector
        ? Math.max(0, this.cosineSimilarity(dto.query_vector, candidate.vector))
        : undefined;
      const relevance_score = semanticScore === undefined ? lexicalScore : (semanticScore * 0.7) + (lexicalScore * 0.3);
      if (!Number.isFinite(relevance_score)) throw new InputValidationError('reranking score must be finite');
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
      a.result.id.localeCompare(b.result.id)
    );

    return {
      results: rankedResults.slice(0, dto.top_n).map(({ result }) => result)
    };
  }
}
