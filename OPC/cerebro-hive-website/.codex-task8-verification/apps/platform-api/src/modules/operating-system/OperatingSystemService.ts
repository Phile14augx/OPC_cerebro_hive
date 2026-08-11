import type {
  OperatingSystemRepository,
  RequestContext,
} from '@cerebro/db';

import type {
  DemoMode,
  EntityDetail,
  OperatingGraphSnapshot,
  OperatingNodeType,
} from '../../../../../packages/shared-types/src/domain/operating-system';
import { createDemoGraphSnapshot } from './demoGraph';

export class DemoModeDisabledError extends Error {
  constructor() {
    super('Demo mode is disabled');
    this.name = 'DemoModeDisabledError';
  }
}

export class OperatingSystemService {
  constructor(private readonly repository: OperatingSystemRepository) {}

  getSnapshot(
    context: RequestContext,
    mode: DemoMode = 'live',
  ): Promise<OperatingGraphSnapshot> {
    if (mode === 'demo') {
      if (
        process.env.NODE_ENV === 'production' ||
        process.env.CEREBRO_COMPANY_OS_DEMO !== 'enabled'
      ) {
        throw new DemoModeDisabledError();
      }
      return Promise.resolve(createDemoGraphSnapshot());
    }

    return this.repository.getGraphSnapshot({ context });
  }

  getEntityDetail(
    context: RequestContext,
    type: OperatingNodeType,
    id: string,
  ): Promise<EntityDetail | null> {
    return this.repository.getEntityDetail(type, id, { context });
  }
}
