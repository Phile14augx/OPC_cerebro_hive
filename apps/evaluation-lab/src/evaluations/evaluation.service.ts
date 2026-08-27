import { Injectable } from '@nestjs/common';

@Injectable()
export class EvaluationService {
  create(evalDto: any) {
    return {
      evaluation_id: 'ev_' + Math.random().toString(36).substring(7),
      status: 'QUEUED',
    };
  }

  findOne(id: string) {
    return {
      evaluation_id: id,
      status: 'COMPLETED',
      summary: {
        faithfulness: 0.92,
        latency_p95_ms: 1200,
      },
      passed_thresholds: true,
    };
  }
}
