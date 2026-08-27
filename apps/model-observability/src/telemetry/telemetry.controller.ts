import { Controller, Post, Get, Body, Param, HttpCode } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

@Controller()
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('v1/telemetry/traces')
  @HttpCode(202)
  async ingestTraces(@Body() payload: any) {
    await this.telemetryService.ingestTraces(payload);
  }

  @Post('api/v1/observability/hallucination/feedback')
  @HttpCode(200)
  async hallucinationFeedback(@Body() payload: any) {
    await this.telemetryService.hallucinationFeedback(payload);
  }

  @Get('api/v1/observability/metrics/:model_id')
  async getMetrics(@Param('model_id') modelId: string) {
    return this.telemetryService.getMetrics(modelId);
  }
}
