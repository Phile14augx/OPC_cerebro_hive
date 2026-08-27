import { Injectable } from '@nestjs/common';

@Injectable()
export class MlflowService {
  createRun() {
    return { run: { info: { run_id: 'test-run-id', status: 'RUNNING' } } };
  }

  logMetric() {
    return {};
  }

  logParameter() {
    return {};
  }
}
