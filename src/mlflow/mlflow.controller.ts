import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ExperimentService } from './experiment.service';
import { ModelRegistryService, ModelStage } from './model-registry.service';

@Controller('api/2.0/mlflow')
export class MlflowController {
  constructor(
    private readonly experimentService: ExperimentService,
    private readonly modelRegistryService: ModelRegistryService
  ) {}

  @Post('experiments/create')
  createExperiment(@Body() body: { name: string }) {
    return this.experimentService.createExperiment(body.name);
  }

  @Post('runs/create')
  createRun(@Body() body: { experiment_id: string }) {
    return this.experimentService.createRun(body.experiment_id);
  }

  @Post('runs/log-metric')
  logMetric(@Body() body: { run_id: string, key: string, value: number }) {
    this.experimentService.logMetric(body.run_id, body.key, body.value);
    return {};
  }

  @Post('runs/log-parameter')
  logParameter(@Body() body: { run_id: string, key: string, value: string }) {
    this.experimentService.logParameter(body.run_id, body.key, body.value);
    return {};
  }

  @Get('experiments/:id/runs')
  listRuns(@Param('id') experimentId: string) {
    return this.experimentService.listRuns(experimentId);
  }

  @Post('registered-models/create')
  createRegisteredModel(@Body() body: { name: string }) {
    return this.modelRegistryService.registerModel(body.name);
  }

  @Post('model-versions/create')
  createModelVersion(@Body() body: { name: string, run_id: string }) {
    return this.modelRegistryService.createModelVersion(body.name, body.run_id);
  }

  @Patch('model-versions/transition-stage')
  transitionModelVersionStage(@Body() body: { name: string, version: number, stage: ModelStage }) {
    return this.modelRegistryService.transitionModelVersionStage(body.name, body.version, body.stage);
  }
}
