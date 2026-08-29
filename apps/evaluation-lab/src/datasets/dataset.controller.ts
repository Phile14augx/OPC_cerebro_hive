import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { DatasetService } from './dataset.service';

class CreateDatasetDto {
  name: string;
  description: string;
  type: string;
  source_uri: string;
}

@Controller('datasets')
export class DatasetController {
  constructor(private readonly datasetService: DatasetService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createDatasetDto: CreateDatasetDto) {
    return this.datasetService.create(createDatasetDto);
  }
}
