import { Module } from '@nestjs/common';
import { QueryLayerService } from './query-layer.service';
import { GraphStorageModule } from '../graph-storage/graph-storage.module';

@Module({
  imports: [GraphStorageModule],
  providers: [QueryLayerService],
  exports: [QueryLayerService],
})
export class QueryLayerModule {}
