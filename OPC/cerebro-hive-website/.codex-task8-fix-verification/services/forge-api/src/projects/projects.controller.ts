import {
  Controller, Get, Post, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('forge/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new forge project' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all forge projects' })
  findAll(@Query('workspaceId') workspaceId?: string) {
    return this.projectsService.findAll(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a forge project with all details' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a forge project' })
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}
