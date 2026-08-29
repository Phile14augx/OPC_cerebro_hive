import { Module } from '@nestjs/common';
import { MlflowModule } from './mlflow/mlflow.module';
import { ExecutionModule } from './execution/execution.module';
import { HybridRetrievalEngine } from './engine';
import { PrismaVectorStore, MockAnnIndex } from './store';

@Module({
  imports: [MlflowModule, ExecutionModule],
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
