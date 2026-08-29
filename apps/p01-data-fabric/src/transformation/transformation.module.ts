import { Module } from '@nestjs/common';
import { TransformationController } from './transformation.controller';
import { TransformationService } from './transformation.service';

@Module({
  controllers: [TransformationController],
  providers: [TransformationService],
  exports: [TransformationService]
})
export class TransformationModule {}