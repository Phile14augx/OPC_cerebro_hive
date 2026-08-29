export class RerankCandidateDto {
  id: string;
  text: string;
  vector?: number[];
}

export class RerankDto {
  query_text: string;
  query_vector?: number[];
  candidates: RerankCandidateDto[];
  top_n: number;
}

export class RerankResultItemDto {
  id: string;
  relevance_score: number;
}

export class RerankResponseDto {
  results: RerankResultItemDto[];
}
