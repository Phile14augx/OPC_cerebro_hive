import { describe, expect, it } from 'vitest';
import { ConsentLedgerService } from '../../src/services/consent-ledger.service';

describe('Consent Ledger Integration', () => {
  it('keeps active consent isolated by subject and excludes revoked entries', () => {
    const ledger = new ConsentLedgerService();
    const marketing = ledger.createConsent('subject-1', 'consent', 'marketing');
    const billing = ledger.createConsent('subject-1', 'contract', 'billing');
    ledger.createConsent('subject-2', 'consent', 'marketing');

    const revoked = ledger.revokeConsent(marketing.id);

    expect(revoked.revokedAt).toBeInstanceOf(Date);
    expect(ledger.getActiveConsents('subject-1')).toEqual([billing]);
    expect(ledger.getActiveConsents('subject-2')).toHaveLength(1);
  });

  it('returns the original ledger entry when revocation is repeated', () => {
    const ledger = new ConsentLedgerService();
    const consent = ledger.createConsent('subject-1', 'consent', 'analytics');
    const firstRevocation = ledger.revokeConsent(consent.id);

    expect(ledger.revokeConsent(consent.id)).toBe(firstRevocation);
    expect(ledger.getActiveConsents('subject-1')).toEqual([]);
  });
});
