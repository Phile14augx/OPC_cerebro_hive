export interface Provenance {
  createdBy: string;
  sourceSystem: string;
  confidenceScore: number; // 0.0 to 1.0
  createdAt: Date;
  updatedAt: Date;
}
