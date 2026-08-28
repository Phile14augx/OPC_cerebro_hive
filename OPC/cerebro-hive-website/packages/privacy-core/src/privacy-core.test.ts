import { describe, expect, it } from 'vitest';

import { ConsentRegistry } from './consent/ConsentRegistry';
import { PrivacyPolicyEngine } from './enforcement/PrivacyPolicyEngine';
import { ProcessingRegistry } from './processing/ProcessingRegistry';

describe('PrivacyPolicyEngine', () => {
  it('requires active consent and an allowed processing region for consent-based activity', () => {
    const consents = new ConsentRegistry();
    const activities = new ProcessingRegistry();
    const catalog = new Map([
      ['customer-data', {
        id: 'customer-data',
        residency: {
          originRegion: 'EU',
          allowedStorageRegions: ['EU-West-1'],
          allowedProcessingRegions: ['EU'],
          transferRestricted: true,
        },
      }],
    ]);
    const engine = new PrivacyPolicyEngine(consents, activities, catalog);

    activities.registerActivity({
      id: 'marketing',
      name: 'Marketing',
      purpose: 'Marketing',
      legalBasis: 'Consent',
      datasetIds: ['customer-data'],
      controllerId: 'marketing-team',
      processorIds: [],
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    });

    expect(engine.evaluate({ principalId: 'alice', processingActivityId: 'marketing', targetProcessingRegion: 'EU' }))
      .toMatchObject({ allowed: false, reason: 'No valid consent found for purpose: Marketing' });

    consents.recordConsent({
      id: 'consent-1',
      principalId: 'alice',
      purpose: 'Marketing',
      legalBasis: 'Consent',
      status: 'Granted',
      collectionMethod: 'web',
      policyVersion: 'v1',
      noticeVersion: 'v1',
      grantedAt: new Date('2026-01-01T00:00:00Z'),
    });

    expect(engine.evaluate({ principalId: 'alice', processingActivityId: 'marketing', targetProcessingRegion: 'EU' }))
      .toEqual({ allowed: true, reason: 'Privacy policies satisfied' });
    expect(engine.evaluate({ principalId: 'alice', processingActivityId: 'marketing', targetProcessingRegion: 'US' }))
      .toMatchObject({ allowed: false, residencyViolation: true });
  });
});
