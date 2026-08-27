import { Module } from '@nestjs/common';
import { DriftService } from './drift.service';

@Module({
  providers: [DriftService],
  exports: [DriftService]
})
export class DriftModule {}
