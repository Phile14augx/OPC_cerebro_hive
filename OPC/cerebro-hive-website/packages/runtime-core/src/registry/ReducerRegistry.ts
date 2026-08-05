import { DeterministicReducer } from '@cerebro/runtime-contracts/src/replay/DeterministicReplayContract';
import { ExecutionEvent } from '@cerebro/runtime-contracts/src/events/ExecutionEvent';

export class ReducerRegistry {
  private reducers: Map<string, DeterministicReducer<any, any>> = new Map();
  private isFrozen = false;

  public freeze(): void {
    this.isFrozen = true;
  }

  public register<TState, TEvent extends ExecutionEvent>(
    eventType: string,
    reducer: DeterministicReducer<TState, TEvent>
  ): void {
    if (this.isFrozen) throw new Error('Cannot register reducers after runtime has started.');
    if (this.reducers.has(eventType)) {
      throw new Error(`Reducer for event type ${eventType} is already registered.`);
    }
    this.reducers.set(eventType, reducer);
  }

  public getReducer(eventType: string): DeterministicReducer<any, any> | undefined {
    return this.reducers.get(eventType);
  }

  public hasReducer(eventType: string): boolean {
    return this.reducers.has(eventType);
  }
}
