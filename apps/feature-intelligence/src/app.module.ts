import { Module } from '@nestjs/common';
import { FeatureStoreController } from './feature-store/feature-store.controller';
import { FeatureStoreService } from './feature-store/feature-store.service';
import { EmbeddingPipelineService } from './embedding/embedding-pipeline.service';

@Module({
  imports: [],
  controllers: [FeatureStoreController],
  providers: [FeatureStoreService, EmbeddingPipelineService],
})
export class AppModule {}
