import { Module } from '@nestjs/common';
import { FeatureStoreController } from './feature-store/feature-store.controller';
import { FeatureStoreService } from './feature-store/feature-store.service';
import { TransformationEngineService } from './transformations/transformation-engine.service';
import { EmbeddingPipelineService } from './embeddings/embedding-pipeline.service';

@Module({
  imports: [],
  controllers: [FeatureStoreController],
  providers: [FeatureStoreService, TransformationEngineService, EmbeddingPipelineService],
})
export class AppModule {}
