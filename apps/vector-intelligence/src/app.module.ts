import { Module } from '@nestjs/common';
import { VectorStoreService } from './services/vector-store.service';
import { HybridRetrievalService } from './services/hybrid-retrieval.service';
import { RerankingService } from './services/reranking.service';

@Module({
  imports: [],
  controllers: [],
  providers: [VectorStoreService, HybridRetrievalService, RerankingService],
})
export class AppModule {}
