import { Module } from '@nestjs/common';
import { ActiveLearningService } from './active-learning.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ActiveLearningService],
})
export class AppModule {}
