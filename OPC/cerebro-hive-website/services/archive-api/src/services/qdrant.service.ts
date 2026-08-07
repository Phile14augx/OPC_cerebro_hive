import { QdrantClient } from '@qdrant/js-client-rest';
import { env } from '../config/env.js';

let qdrantClient: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!qdrantClient) {
    if (!env.QDRANT_URL) {
      throw new Error('QDRANT_URL is required to initialize Qdrant client.');
    }
    qdrantClient = new QdrantClient({
      url: env.QDRANT_URL,
      apiKey: env.QDRANT_API_KEY,
    });
  }
  return qdrantClient;
}
