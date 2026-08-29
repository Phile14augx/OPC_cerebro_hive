import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import type { ConnectorRequest } from './ingestion.service';

@Controller('v1/ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('connectors')
  createConnector(@Body() body: unknown) {
    if (!isRecord(body) || typeof body.id !== 'string' || typeof body.type !== 'string') {
      throw new BadRequestException('Connector request requires string id and type');
    }
    return this.ingestionService.createConnector(body as unknown as ConnectorRequest);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
