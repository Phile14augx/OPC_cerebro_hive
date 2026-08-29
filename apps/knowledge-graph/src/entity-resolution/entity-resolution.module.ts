import { Module } from '@nestjs/common';
import { EntityResolutionService } from './entity-resolution.service';
import { GraphStorageModule } from '../graph-storage/graph-storage.module';

@Module({
  imports: [GraphStorageModule],
  providers: [EntityResolutionService],
  exports: [EntityResolutionService],
})
export class EntityResolutionModule {}
