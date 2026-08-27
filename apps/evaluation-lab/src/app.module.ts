import { Module } from '@nestjs/common';
import { DatasetModule } from './datasets/dataset.module';
import { EvaluationModule } from './evaluations/evaluation.module';
import { AdversarialModule } from './adversarial/adversarial.module';
import { BenchmarkModule } from './benchmarks/benchmark.module';

@Module({
  imports: [DatasetModule, EvaluationModule, AdversarialModule, BenchmarkModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
