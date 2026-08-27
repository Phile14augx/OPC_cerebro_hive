import { Controller, Post, Body } from '@nestjs/common';
import { TransformationService } from './transformation.service';

@Controller('v1/transform')
export class TransformationController {
  constructor(private readonly transformationService: TransformationService) {}

  @Post('jobs')
  triggerJob(@Body() body: any) {
    return this.transformationService.triggerJob(body);
  }
}