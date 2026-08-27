import { Injectable } from '@nestjs/common';

@Injectable()
export class FederationService {
  executeQuery(data: any) {
    return { status: 'Query executed', result: [] };
  }
}