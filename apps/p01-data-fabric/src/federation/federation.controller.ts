import { Controller, Post, Body } from '@nestjs/common';
import { FederationService } from './federation.service';

@Controller('v1/query')
export class FederationController {
  constructor(private readonly federationService: FederationService) {}

  @Post()
  executeQuery(@Body() body: any) {
    return this.federationService.executeQuery(body);
  }
}