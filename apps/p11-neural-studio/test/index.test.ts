import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { NeuralStudioClient } from '../src/index';

describe('NeuralStudioClient', () => {
  test('should initialize session successfully', () => {
    const client = new NeuralStudioClient({ apiKey: 'test', endpoint: 'http://localhost' });
    const session = client.initializeSession();
    
    assert.strictEqual(session.status, 'active');
    assert.ok(session.id.startsWith('session_'));
  });
});
