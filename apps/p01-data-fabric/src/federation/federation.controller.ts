import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { FederationService } from './federation.service';
import type { FederationRequest } from './federation.service';

@Controller('v1/query')
export class FederationController {
  constructor(private readonly federationService: FederationService) {}

  @Post()
  executeQuery(@Body() body: unknown) {
    if (!isRecord(body) || typeof body.sql !== 'string'
      || (body.sources !== undefined && (!Array.isArray(body.sources) || body.sources.some((source) => typeof source !== 'string')))
      || (body.failureMode !== undefined && body.failureMode !== 'partial' && body.failureMode !== 'fail-fast')) {
      throw new BadRequestException('Federation request requires sql and valid optional sources/failureMode');
    }
    return this.federationService.executeQuery(body as unknown as FederationRequest);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
