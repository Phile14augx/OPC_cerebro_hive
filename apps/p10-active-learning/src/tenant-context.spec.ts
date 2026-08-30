import { TenantContext } from './tenant-context';

describe('TenantContext', () => {
  it('creates with a valid tenantId', () => {
    const ctx = new TenantContext('tenant-abc');
    expect(ctx.tenantId).toBe('tenant-abc');
  });

  it('trims whitespace from tenantId', () => {
    const ctx = new TenantContext('  tenant-xyz  ');
    expect(ctx.tenantId).toBe('tenant-xyz');
  });

  it('throws when tenantId is empty string', () => {
    expect(() => new TenantContext('')).toThrow('tenantId must be a non-empty string');
  });

  it('throws when tenantId is only whitespace', () => {
    expect(() => new TenantContext('   ')).toThrow('tenantId must be a non-empty string');
  });

  it('returns a readable toString()', () => {
    const ctx = new TenantContext('t1');
    expect(ctx.toString()).toBe('TenantContext(t1)');
  });
});
