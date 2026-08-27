export class SparseValuesDto {
  indices: number[];
  values: number[];
}

export class VectorUpsertItemDto {
  id: string;
  values: number[];
  sparse_values?: SparseValuesDto;
  metadata?: Record<string, any>;
}

export class VectorUpsertDto {
  namespace: string;
  vectors: VectorUpsertItemDto[];
}
