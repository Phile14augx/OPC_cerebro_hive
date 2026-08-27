import { Controller, Post, Body } from '@nestjs/common';
import { MlflowService } from './mlflow.service';

@Controller('api/2.0/mlflow')
export class MlflowController {
  constructor(private readonly mlflowService: MlflowService) {}

  @Post('runs/create')
  createRun(@Body() body: any) {
    return this.mlflowService.createRun();
  }

  @Post('runs/log-metric')
  logMetric(@Body() body: any) {
    return this.mlflowService.logMetric();
  }

  @Post('runs/log-parameter')
  logParameter(@Body() body: any) {
    return this.mlflowService.logParameter();
  }
}
