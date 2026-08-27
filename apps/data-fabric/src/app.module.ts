import { Module } from '@nestjs/common';
import { TransformationEngineService } from './transformation/engine.service.js';
import { QueryFederationService } from './federation/query-federation.service.js';

@Module({
  imports: [],
  providers: [TransformationEngineService, QueryFederationService],
  exports: [TransformationEngineService, QueryFederationService],
})
export class AppModule {}
