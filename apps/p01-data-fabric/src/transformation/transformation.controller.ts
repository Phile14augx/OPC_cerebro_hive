import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { TransformationService } from './transformation.service';
import type { TransformationRequest } from './transformation.service';

@Controller('v1/transform')
export class TransformationController {
  constructor(private readonly transformationService: TransformationService) {}

  @Post('jobs')
  triggerJob(@Body() body: unknown) {
    if (!isRecord(body) || typeof body.id !== 'string' || !isRecord(body.input) || !Array.isArray(body.steps)) {
      throw new BadRequestException('Transformation request requires id, input, and steps');
    }
    return this.transformationService.triggerJob(body as unknown as TransformationRequest);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
