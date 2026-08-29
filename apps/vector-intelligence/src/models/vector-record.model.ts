export class VectorRecord {
  id: string;
  namespaceId: string;
  externalId: string;
  embedding: number[];
  sparseText?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
