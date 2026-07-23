import { Controller, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DeployService } from './deploy.service';

@ApiTags('Deploy')
@ApiBearerAuth()
@Controller('forge/projects/:id/deploy')
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  @Post()
  @ApiOperation({ summary: 'Run DevOps agent to generate deployment artifacts' })
  @ApiQuery({ name: 'environment', required: false, enum: ['development', 'staging', 'production'] })
  generate(
    @Param('id') id: string,
    @Query('environment') environment = 'production',
  ) {
    return this.deployService.generateDeployment(id, environment);
  }
}
