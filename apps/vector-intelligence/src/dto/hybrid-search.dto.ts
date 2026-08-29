export class HybridSearchDto {
  namespace: string;
  query_vector: number[];
  query_text?: string;
  top_k: number;
  filter?: Record<string, any>;
  fusion_strategy?: 'RRF';
  include_metadata?: boolean;
}

export class SearchResultItemDto {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

export class SearchResponseDto {
  results: SearchResultItemDto[];
}
