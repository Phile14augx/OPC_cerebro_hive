import { Module } from '@nestjs/common';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { BenchmarkModule } from '../benchmarks/benchmark.module';
import { AdversarialModule } from '../adversarial/adversarial.module';

@Module({
  imports: [BenchmarkModule, AdversarialModule],
  controllers: [EvaluationController],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
