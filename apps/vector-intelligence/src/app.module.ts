import { Module } from '@nestjs/common';
import { VectorStoreService } from './services/vector-store.service';
import { HybridRetrievalService } from './services/hybrid-retrieval.service';
import { RerankingService } from './services/reranking.service';
import { join } from 'node:path';
import { VECTOR_REPOSITORY } from './ports/vector-repository.port';
import { JsonFileVectorRepository } from './adapters/json-file-vector.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    { provide: VECTOR_REPOSITORY, useFactory: () => new JsonFileVectorRepository(process.env.P03_VECTOR_DATA_PATH ?? join(process.cwd(), 'data', 'p03-vectors.json')) },
    VectorStoreService,
    HybridRetrievalService,
    RerankingService,
  ],
})
export class AppModule {}
