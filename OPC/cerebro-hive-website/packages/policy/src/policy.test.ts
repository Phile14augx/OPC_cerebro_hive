import { describe, expect, it } from 'vitest';
import { PolicyEngine } from './index';

describe('PolicyEngine', () => {
  it('defaults to deny and gives matching deny rules precedence', () => {
    const engine = new PolicyEngine();
    const context = { subject: { id: 'alice', roles: [], attributes: {} }, resource: { type: 'record', attributes: {} }, action: 'read' };
    expect(engine.evaluate(context)).toMatchObject({ allowed: false });
    engine.registerRule({ id: 'allow', description: 'allow', effect: 'allow', condition: () => true });
    engine.registerRule({ id: 'deny', description: 'deny', effect: 'deny', condition: () => true });
    expect(engine.evaluate(context)).toMatchObject({ allowed: false, reason: 'Denied by rule: deny' });
  });
});
