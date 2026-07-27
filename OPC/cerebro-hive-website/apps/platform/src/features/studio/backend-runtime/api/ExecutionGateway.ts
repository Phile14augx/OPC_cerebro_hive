
import { ReleaseResolver, ExecutionDescriptor } from './ExecutionDescriptor';
import { ExecutionTrigger } from './ExecutionScheduler';

export class ExecutionGateway {
  constructor(private resolver: ReleaseResolver) {}

  async ingest(trigger: ExecutionTrigger) {
    // 1. Resolve Deployment
    const descriptor = await this.resolver.resolve(trigger.tenantId, 'target-workflow', 'Production');
    
    // 2. Route to Temporal / Orchestrator
    console.log(`[Gateway] Routing to Temporal Interpreter for Release: ${descriptor.releaseId}`);
  }
}
