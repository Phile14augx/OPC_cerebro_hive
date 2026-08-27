import { Module } from '@nestjs/common';
import { GraphStorageService } from './graph-storage.service';

@Module({
  providers: [GraphStorageService],
  exports: [GraphStorageService],
})
export class GraphStorageModule {}
