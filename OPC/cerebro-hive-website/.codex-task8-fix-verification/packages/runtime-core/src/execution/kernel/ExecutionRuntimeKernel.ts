import { ExecutionCommandHandler } from '../commands/ExecutionCommandHandler';
import { ExecutionCommand } from '@cerebro/runtime-contracts/src/commands/ExecutionCommand';

export class ExecutionRuntimeKernel {
  constructor(
    private readonly commandHandler: ExecutionCommandHandler,
    // Future composition dependencies (P5.22 - P5.26):
    // private readonly eventStore: EventStore,
    // private readonly reducerRegistry: ReducerRegistry,
    // private readonly projectionManager: ProjectionManager,
    // private readonly leaseManager: ExecutionLeaseManager,
    // private readonly replayService: ExecutionReplayService,
    // private readonly sagaCoordinator: SagaCoordinator,
  ) {}

  /**
   * The single entry point for initiating any state transition in the Execution platform.
   */
  async dispatchCommand(command: ExecutionCommand): Promise<any> {
    // In a fully generalized command bus, this might route to different handlers.
    // For now, it delegates to the ExecutionCommandHandler.
    return this.commandHandler.handle(command);
  }
}
