import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ArchitectService } from './architect.service';

@ApiTags('Architecture')
@ApiBearerAuth()
@Controller('forge/projects/:id/architecture')
export class ArchitectController {
  constructor(private readonly architectService: ArchitectService) {}

  @Post()
  @ApiOperation({ summary: 'Run the Architect agent to design system architecture' })
  design(@Param('id') id: string) {
    return this.architectService.design(id);
  }
}
