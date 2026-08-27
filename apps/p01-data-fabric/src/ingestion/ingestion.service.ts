import { Injectable } from '@nestjs/common';

@Injectable()
export class IngestionService {
  createConnector(data: any) {
    return { status: 'Connector created', data };
  }
}