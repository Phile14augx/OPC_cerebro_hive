import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RequirementsService } from './requirements.service';

@ApiTags('Requirements')
@ApiBearerAuth()
@Controller('forge/projects/:id/requirements')
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Post()
  @ApiOperation({ summary: 'Run the PM agent to generate requirements from the plan' })
  generate(@Param('id') id: string) {
    return this.requirementsService.generate(id);
  }
}
