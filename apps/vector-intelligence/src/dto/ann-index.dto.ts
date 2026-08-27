export class HnswParamsDto {
  m: number;
  efConstruction: number;
}

export class IvfParamsDto {
  lists: number;
}

export class AnnIndexConfigDto {
  algorithm: 'HNSW' | 'IVF';
  hnswParams?: HnswParamsDto;
  ivfParams?: IvfParamsDto;
}
