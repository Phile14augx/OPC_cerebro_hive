import { Module } from '@nestjs/common';
import { MlflowModule } from './mlflow/mlflow.module';
import { ExecutionModule } from './execution/execution.module';

@Module({
  imports: [MlflowModule, ExecutionModule],
})
export class AppModule {}
