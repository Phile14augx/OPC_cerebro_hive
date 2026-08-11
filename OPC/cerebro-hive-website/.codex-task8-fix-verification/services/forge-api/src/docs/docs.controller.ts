import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocsService } from './docs.service';

@ApiTags('Docs')
@ApiBearerAuth()
@Controller('forge/projects/:id/docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Post()
  @ApiOperation({ summary: 'Run Docs agent to generate all technical documentation' })
  generate(@Param('id') id: string) {
    return this.docsService.generate(id);
  }
}
