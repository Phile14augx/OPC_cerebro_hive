import { DeterministicReducer } from '@cerebro/runtime-contracts/src/replay/DeterministicReplayContract';
import { ExecutionEvent } from '@cerebro/runtime-contracts/src/events/ExecutionEvent';

export class ReducerRegistry<TState = unknown, TEventBase extends ExecutionEvent<unknown> = ExecutionEvent<unknown>> {
  private reducers: Map<string, DeterministicReducer<TState, TEventBase>> = new Map();
  private isFrozen = false;

  public freeze(): void {
    this.isFrozen = true;
  }

  public register(
    eventType: string,
    reducer: DeterministicReducer<TState, TEventBase>
  ): void {
    if (this.isFrozen) throw new Error('Cannot register reducers after runtime has started.');
    if (this.reducers.has(eventType)) {
      throw new Error(`Reducer for event type ${eventType} is already registered.`);
    }
    this.reducers.set(eventType, reducer);
  }

  public getReducer(eventType: string): DeterministicReducer<TState, TEventBase> | undefined {
    return this.reducers.get(eventType);
  }

  public hasReducer(eventType: string): boolean {
    return this.reducers.has(eventType);
  }
}
