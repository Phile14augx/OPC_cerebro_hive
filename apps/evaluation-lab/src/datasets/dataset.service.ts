import { Injectable } from '@nestjs/common';

@Injectable()
export class DatasetService {
  create(datasetDto: any) {
    return {
      dataset_id: 'ds_' + Math.random().toString(36).substring(7),
      status: 'INGESTING',
    };
  }
}
