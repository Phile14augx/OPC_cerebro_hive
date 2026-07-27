
export interface ArtifactReference {
  uri: string; // e.g. s3://bucket/execution-123/image.png
  contentType: string;
  sizeBytes: number;
  hash: string;
}

export class ArtifactStore {
  // Abstracts S3, MinIO, GCS
  async put(buffer: Buffer, contentType: string): Promise<ArtifactReference> {
    const uri = `s3://data/${crypto.randomUUID()}`;
    return { uri, contentType, sizeBytes: buffer.length, hash: 'mock-hash' };
  }

  async get(ref: ArtifactReference): Promise<Buffer> {
    return Buffer.from('mock-data');
  }
}
