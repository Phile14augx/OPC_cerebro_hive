export class RerankCandidateDto {
  id: string;
  text: string;
}

export class RerankDto {
  query_text: string;
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
