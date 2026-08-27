import { Module } from '@nestjs/common';
import { MlflowController } from './mlflow.controller';
import { MlflowService } from './mlflow.service';

@Module({
  controllers: [MlflowController],
  providers: [MlflowService],
})
export class MlflowModule {}
