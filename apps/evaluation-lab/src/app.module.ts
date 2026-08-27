import { Module } from '@nestjs/common';
import { DatasetModule } from './datasets/dataset.module';
import { EvaluationModule } from './evaluations/evaluation.module';
import { AdversarialModule } from './adversarial/adversarial.module';

@Module({
  imports: [DatasetModule, EvaluationModule, AdversarialModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
