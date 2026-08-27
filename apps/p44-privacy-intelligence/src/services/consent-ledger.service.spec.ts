import { describe, it, expect, beforeEach } from 'vitest';
import { ConsentLedgerService } from './consent-ledger.service';
import { NotFoundException } from '@nestjs/common';

describe('ConsentLedgerService', () => {
  let service: ConsentLedgerService;

  beforeEach(() => {
    service = new ConsentLedgerService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a consent', () => {
    const consent = service.createConsent('sub-1', 'consent', 'marketing');
    expect(consent).toBeDefined();
    expect(consent.userId).toBe('sub-1');
    expect(consent.lawfulBasis).toBe('consent');
    expect(consent.purpose).toBe('marketing');
    expect(consent.grantedAt).toBeInstanceOf(Date);
  });

  it('should get active consents', () => {
    service.createConsent('sub-1', 'consent', 'marketing');
    service.createConsent('sub-1', 'contract', 'billing');
    service.createConsent('sub-2', 'consent', 'marketing');

    const active = service.getActiveConsents('sub-1');
    expect(active).toHaveLength(2);
    expect(active.every(c => c.userId === 'sub-1')).toBe(true);
  });

  it('should revoke consent', () => {
    const consent = service.createConsent('sub-1', 'consent', 'marketing');
    const activeBefore = service.getActiveConsents('sub-1');
    expect(activeBefore).toHaveLength(1);

    const revoked = service.revokeConsent(consent.id);
    expect(revoked.revokedAt).toBeInstanceOf(Date);

    const activeAfter = service.getActiveConsents('sub-1');
    expect(activeAfter).toHaveLength(0);
  });

  it('should return same consent if already revoked', () => {
    const consent = service.createConsent('sub-1', 'consent', 'marketing');
    service.revokeConsent(consent.id);
    const revokeAgain = service.revokeConsent(consent.id);
    expect(revokeAgain.id).toBe(consent.id);
  });

  it('should throw NotFoundException when revoking non-existent consent', () => {
    expect(() => service.revokeConsent('non-existent')).toThrow(NotFoundException);
  });
});
