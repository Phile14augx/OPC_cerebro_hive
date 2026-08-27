import { Module } from '@nestjs/common';
import { MlflowController } from './mlflow.controller';
import { ExperimentService } from './experiment.service';
import { ModelRegistryService } from './model-registry.service';

@Module({
  controllers: [MlflowController],
  providers: [ExperimentService, ModelRegistryService],
  exports: [ExperimentService, ModelRegistryService],
})
export class MlflowModule {}
