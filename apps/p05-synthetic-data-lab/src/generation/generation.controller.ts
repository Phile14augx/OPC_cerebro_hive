import { BadRequestException } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { ExecutionContext } from '../../../../packages/runtime-core/src/context/ExecutionContext';

export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  triggerGeneration(
    payload: { 
      id: string; 
      type: string; 
      schema: any; 
      targetRows: number; 
      sourceQuery?: string; 
      featureService?: string;
      privacy?: { k: number; quasiIdentifiers?: string[] };
    }, 
    context: ExecutionContext
  ) {
    if (!payload || !payload.id || !payload.schema || typeof payload.targetRows !== 'number') {
      throw new BadRequestException('Invalid payload');
    }
    return this.generationService.triggerGeneration(payload, context);
  }
}
