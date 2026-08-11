export interface SchemaDefinition {
  id: string;
  datasetId: string;
  version: number;
  format: 'JSONSchema' | 'Protobuf' | 'Avro' | 'GraphQL';
  definition: string; // The passive schema string
  backwardCompatible: boolean;
  publishedAt: Date;
}

export class SchemaRegistry {
  private schemas = new Map<string, SchemaDefinition[]>(); // datasetId -> versions

  registerSchema(schema: SchemaDefinition) {
    const existing = this.schemas.get(schema.datasetId) || [];
    existing.push(schema);
    this.schemas.set(schema.datasetId, existing.sort((a, b) => b.version - a.version)); // Latest first
  }

  getLatestSchema(datasetId: string): SchemaDefinition | undefined {
    const existing = this.schemas.get(datasetId);
    return existing && existing.length > 0 ? existing[0] : undefined;
  }
}
