import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TestingService } from './testing.service';

@ApiTags('Testing')
@ApiBearerAuth()
@Controller('forge/projects/:id/testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Post()
  @ApiOperation({ summary: 'Run QA + Security agents to generate test suites' })
  generate(@Param('id') id: string) {
    return this.testingService.generateTests(id);
  }
}
