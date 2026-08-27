import { Injectable } from '@nestjs/common';

@Injectable()
export class TransformationService {
  triggerJob(data: any) {
    return { status: 'Job accepted', data };
  }
}