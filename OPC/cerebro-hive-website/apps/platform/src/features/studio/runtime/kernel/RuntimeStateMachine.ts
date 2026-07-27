/**
 * M24 — RuntimeStateMachine
 *
 * Validated state transitions eliminate whole classes of future bugs.
 * All transitions must go through transitionTo() — no direct string mutation.
 */

export type RuntimeState =
  | 'IDLE'
  | 'COMPILING'
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'STEPPING'
  | 'FINISHED'
  | 'CANCELLED'
  | 'ERROR';

type Transition = `${RuntimeState} → ${RuntimeState}`;

const VALID_TRANSITIONS = new Set<Transition>([
  'IDLE → COMPILING',
  'IDLE → READY',          // pre-compiled path
  'COMPILING → READY',
  'COMPILING → ERROR',
  'READY → RUNNING',
  'RUNNING → PAUSED',
  'RUNNING → STEPPING',
  'RUNNING → FINISHED',
  'RUNNING → CANCELLED',
  'RUNNING → ERROR',
  'PAUSED → RUNNING',
  'PAUSED → STEPPING',
  'PAUSED → CANCELLED',
  'STEPPING → PAUSED',
  'STEPPING → FINISHED',
  'STEPPING → CANCELLED',
  'FINISHED → IDLE',        // reset for next run
  'CANCELLED → IDLE',
  'ERROR → IDLE',
]);

export class RuntimeStateMachine {
  private _state: RuntimeState = 'IDLE';
  private listeners: ((from: RuntimeState, to: RuntimeState) => void)[] = [];

  get state(): RuntimeState { return this._state; }

  onTransition(listener: (from: RuntimeState, to: RuntimeState) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  transitionTo(next: RuntimeState): void {
    const t: Transition = `${this._state} → ${next}`;
    if (!VALID_TRANSITIONS.has(t)) {
      throw new Error(`[StateMachine] Invalid transition: ${t}`);
    }
    const prev = this._state;
    this._state = next;
    this.listeners.forEach(l => l(prev, next));
  }

  is(...states: RuntimeState[]): boolean { return states.includes(this._state); }
  isTerminal(): boolean { return this.is('FINISHED', 'CANCELLED', 'ERROR'); }
}
