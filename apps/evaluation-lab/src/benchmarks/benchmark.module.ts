import { Module } from '@nestjs/common';
import { BenchmarkRegistryService } from './benchmark.service';

@Module({
  providers: [BenchmarkRegistryService],
  exports: [BenchmarkRegistryService],
})
export class BenchmarkModule {}
