import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { PlannerService } from './planner.service';

class PlanBodyDto {
  @IsString() @IsNotEmpty() prompt!: string;
}

@ApiTags('Planner')
@ApiBearerAuth()
@Controller('forge/projects/:id/plan')
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  @Post()
  @ApiOperation({ summary: 'Run the PM agent to generate a project plan' })
  @ApiBody({ schema: { properties: { prompt: { type: 'string' } } } })
  plan(@Param('id') id: string, @Body() body: PlanBodyDto) {
    return this.plannerService.plan(id, body.prompt);
  }
}
