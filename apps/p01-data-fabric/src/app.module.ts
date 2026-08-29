import { Module } from '@nestjs/common';
import { IngestionModule } from './ingestion/ingestion.module';
import { TransformationModule } from './transformation/transformation.module';
import { FederationModule } from './federation/federation.module';

@Module({
  imports: [IngestionModule, TransformationModule, FederationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}