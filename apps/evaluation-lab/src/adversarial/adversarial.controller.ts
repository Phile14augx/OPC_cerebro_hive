import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AdversarialService } from './adversarial.service';

@Controller('adversarial/jobs')
export class AdversarialController {
  constructor(private readonly advService: AdversarialService) {}

  @Post()
  @HttpCode(201)
  create(@Body() jobDto: any) {
    return this.advService.create(jobDto);
  }
}
