import { Module } from '@nestjs/common';
import { GraphEmbeddingService } from './graph-embedding.service';
import { GraphStorageModule } from '../graph-storage/graph-storage.module';

@Module({
  imports: [GraphStorageModule],
  providers: [GraphEmbeddingService],
  exports: [GraphEmbeddingService],
})
export class GraphEmbeddingModule {}
