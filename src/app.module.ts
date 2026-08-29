import { Module } from '@nestjs/common';
import { HybridRetrievalEngine } from './engine';
import { PrismaVectorStore, MockAnnIndex } from './store';

@Module({
  imports: [],
  controllers: [],
  providers: [
    HybridRetrievalEngine,
    MockAnnIndex,
    {
      provide: 'VectorStore',
      useClass: PrismaVectorStore
    }
  ],
})
export class AppModule {}
