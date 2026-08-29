import { BadRequestException } from '@nestjs/common';
import { GenerationService } from './generation.service';

export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  triggerGeneration(payload: { id: string; type: string; schema: any; targetRows: number }) {
    if (!payload || !payload.id || !payload.schema || typeof payload.targetRows !== 'number') {
      throw new BadRequestException('Invalid payload');
    }
    return this.generationService.triggerGeneration(payload);
  }
}
