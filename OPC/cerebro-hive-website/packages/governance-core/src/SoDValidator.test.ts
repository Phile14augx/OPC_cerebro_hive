import { describe, it, expect } from 'vitest';
import { SoDValidator } from './requests/SoDValidator';

describe('governance-core SoDValidator Contract', () => {
  it('should allow a non-conflicting entitlement grant', () => {
    const validator = new SoDValidator();
    validator.addRule({
      id: 'sod-1',
      name: 'Auditor + Admin conflict',
      description: 'Cannot hold both Auditor and System Administrator.',
      conflictingEntitlements: ['ent-auditor', 'ent-sysadmin'],
    });
    const result = validator.validate(['ent-developer'], 'ent-auditor');
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should detect SoD violation when toxic combination is attempted (Negative Control)', () => {
    const validator = new SoDValidator();
    validator.addRule({
      id: 'sod-1',
      name: 'Auditor + Admin conflict',
      description: 'Cannot hold both Auditor and System Administrator.',
      conflictingEntitlements: ['ent-auditor', 'ent-sysadmin'],
    });
    const result = validator.validate(['ent-auditor'], 'ent-sysadmin');
    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0]).toContain('SoD Violation');
  });
});
