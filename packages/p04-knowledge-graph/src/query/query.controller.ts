import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApacheAgeAdapter } from '../graph/adapters/apache-age.adapter';
import { OntologyService } from '../ontology/ontology.service';

@Controller('api/v1/knowledge-graph')
export class QueryController {
  constructor(
    private readonly graphStorage: ApacheAgeAdapter,
    private readonly ontologyService: OntologyService
  ) {}

  @Post('query')
  @HttpCode(HttpStatus.OK)
  async executeQuery(@Body() body: { query: string; parameters?: Record<string, any> }) {
    return this.graphStorage.executeQuery(body.query, body.parameters);
  }

  @Post('entities/merge')
  @HttpCode(HttpStatus.OK)
  async mergeEntities(@Body() body: { sourceNodeId: string; targetNodeId: string; strategy: string }) {
    return this.graphStorage.mergeNodes(body.sourceNodeId, body.targetNodeId, body.strategy);
  }

  @Get('ontology')
  async getOntology() {
    return this.ontologyService.getActiveOntology();
  }
}
