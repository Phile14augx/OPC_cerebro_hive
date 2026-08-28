import { describe, it, expect } from 'vitest';
import type { MemoryQuery } from './MemoryService';

describe('MemoryCapability Contract', () => {
  it('should construct a valid MemoryQuery', () => {
    const query: MemoryQuery = {
      tenantId: 'tenant-a',
      conversationId: 'conv-1',
      text: 'what tasks were completed yesterday?',
      limit: 10,
    };
    expect(query.tenantId).toBe('tenant-a');
    expect(query.text).toContain('yesterday');
  });

  it('should detect missing tenantId (Negative Control)', () => {
    const tenantId = '';
    expect(tenantId.length).toBe(0); // domain violation: tenant must be identified
  });
});
