import { Controller, Post, Get, Param, Body, HttpCode } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';

class CreateEvaluationDto {
  target: any;
  dataset_ids: string[];
  metrics: any[];
}

@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createEvaluationDto: CreateEvaluationDto) {
    return this.evaluationService.create(createEvaluationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationService.findOne(id);
  }
}
