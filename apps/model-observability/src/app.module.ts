import { Module } from '@nestjs/common';
import { TelemetryModule } from './telemetry/telemetry.module';
import { DriftModule } from './drift/drift.module';

@Module({
  imports: [TelemetryModule, DriftModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
