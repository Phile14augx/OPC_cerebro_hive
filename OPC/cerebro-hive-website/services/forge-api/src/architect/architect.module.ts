import { Module } from '@nestjs/common';
import { ArchitectController } from './architect.controller';
import { ArchitectService } from './architect.service';

@Module({
  controllers: [ArchitectController],
  providers: [ArchitectService],
  exports: [ArchitectService],
})
export class ArchitectModule {}
