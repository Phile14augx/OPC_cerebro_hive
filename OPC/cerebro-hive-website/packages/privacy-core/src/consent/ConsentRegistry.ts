export type ConsentStatus = 'Granted' | 'Updated' | 'Withdrawn' | 'Expired' | 'Archived';
export type LegalBasis = 'Consent' | 'Contract' | 'LegalObligation' | 'VitalInterests' | 'PublicTask' | 'LegitimateInterests';

export interface ConsentRecord {
  id: string;
  principalId: string;
  purpose: string; // e.g., 'Analytics', 'Marketing'
  legalBasis: LegalBasis;
  status: ConsentStatus;
  
  collectionMethod: string;
  policyVersion: string;
  noticeVersion: string;
  
  grantedAt: Date;
  validUntil?: Date;
  evidenceReference?: string; // Link to Audit Ledger
}

export class ConsentRegistry {
  private records = new Map<string, ConsentRecord[]>(); // principalId -> records

  recordConsent(record: ConsentRecord) {
    const existing = this.records.get(record.principalId) || [];
    existing.push(record);
    this.records.set(record.principalId, existing);
    console.log(`[ConsentRegistry] 🛡️ Recorded ${record.status} consent for ${record.principalId} (Purpose: ${record.purpose})`);
  }

  getActiveConsent(principalId: string, purpose: string): ConsentRecord | undefined {
    const existing = this.records.get(principalId) || [];
    
    // Get the most recent record for this purpose
    const sorted = existing
      .filter(r => r.purpose === purpose)
      .sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime());

    if (sorted.length === 0) return undefined;
    
    const latest = sorted[0];
    if (latest.status !== 'Granted' && latest.status !== 'Updated') return undefined;
    if (latest.validUntil && latest.validUntil < new Date()) return undefined;

    return latest;
  }
}
