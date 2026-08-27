import { Injectable } from '@nestjs/common';

@Injectable()
export class AdversarialService {
  create(jobDto: any) {
    return {
      job_id: 'adv_' + Math.random().toString(36).substring(7),
      status: 'RUNNING',
    };
  }
}
