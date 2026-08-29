import { Module } from '@nestjs/common';
import { DriftDetectionService } from './drift.service';
import { AlertModule } from '../alert/alert.module';

@Module({
  imports: [AlertModule],
  providers: [DriftDetectionService],
  exports: [DriftDetectionService],
})
export class DriftModule {}
