import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { SessionStateMachine } from '../src/domain/session-state-machine';
import { InvalidTransitionError } from '../src/contracts';

describe('SessionStateMachine', () => {
  test('should allow valid transitions', () => {
    assert.strictEqual(SessionStateMachine.transition('CREATED', 'RUNNING'), 'RUNNING');
    assert.strictEqual(SessionStateMachine.transition('RUNNING', 'PAUSED'), 'PAUSED');
    assert.strictEqual(SessionStateMachine.transition('PAUSED', 'RUNNING'), 'RUNNING');
    assert.strictEqual(SessionStateMachine.transition('RUNNING', 'COMPLETED'), 'COMPLETED');
  });

  test('should throw on invalid transitions', () => {
    assert.throws(() => {
      SessionStateMachine.transition('CREATED', 'PAUSED');
    }, InvalidTransitionError);
    
    assert.throws(() => {
      SessionStateMachine.transition('COMPLETED', 'RUNNING');
    }, InvalidTransitionError);
  });

  test('should return allowed transitions', () => {
    const allowed = SessionStateMachine.allowedTransitions('CREATED');
    assert.deepStrictEqual(allowed, ['RUNNING', 'ARCHIVED']);
  });

  test('should identify terminal states', () => {
    assert.strictEqual(SessionStateMachine.isTerminal('ARCHIVED'), true);
    assert.strictEqual(SessionStateMachine.isTerminal('COMPLETED'), false); // COMPLETED can go to ARCHIVED
    assert.strictEqual(SessionStateMachine.isTerminal('CREATED'), false);
  });
});
