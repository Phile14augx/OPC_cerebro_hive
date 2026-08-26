import { describe, it, expect } from 'vitest';
import { Command } from './Command';
import { Query } from './Query';

class TestCommand extends Command {
  constructor() {
    super('TestCommand');
  }
}

class TestQuery extends Query {
  constructor() {
    super('TestQuery');
  }
}

describe('CoreBus Command/Query Contract', () => {
  it('should create a Command with correct type', () => {
    const cmd = new TestCommand();
    expect(cmd.type).toBe('TestCommand');
  });

  it('should create a Query with correct type (Negative Control)', () => {
    const qry = new TestQuery();
    expect(qry.type).toBe('TestQuery');
    // Different from Command type
    expect(qry.type).not.toBe('TestCommand');
  });
});
