import { describe, it, expect } from 'vitest';
import { ListAgentsQuery } from './ListAgentsQueryHandler';
describe('Query Contract', () => {
  it('should construct ListAgentsQuery with correct type', () => {
    const q = new ListAgentsQuery(10, 0);
    expect(q.type).toBe('ListAgentsQuery');
    expect(q.limit).toBe(10);
  });
  it('should have default undefined limit/offset (Negative Control)', () => {
    const q = new ListAgentsQuery();
    expect(q.limit).toBeUndefined();
    expect(q.offset).toBeUndefined();
  });
});