import { Module } from '@nestjs/common';
import { CodegenController } from './codegen.controller';
import { CodegenService } from './codegen.service';

@Module({
  controllers: [CodegenController],
  providers: [CodegenService],
  exports: [CodegenService],
})
export class CodegenModule {}
