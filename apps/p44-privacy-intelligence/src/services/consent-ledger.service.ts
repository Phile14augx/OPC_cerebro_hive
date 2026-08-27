import { Injectable, NotFoundException } from '@nestjs/common';
import { ConsentLedger } from '../models/consent-ledger.model';
import * as crypto from 'crypto';

@Injectable()
export class ConsentLedgerService {
  private ledgers: ConsentLedger[] = [];

  createConsent(subjectId: string, lawfulBasis: string, purpose: string): ConsentLedger {
    const consent: ConsentLedger = {
      id: crypto.randomUUID(),
      userId: subjectId,
      lawfulBasis,
      purpose,
      grantedAt: new Date(),
    };
    this.ledgers.push(consent);
    return consent;
  }

  getActiveConsents(subjectId: string): ConsentLedger[] {
    return this.ledgers.filter(c => c.userId === subjectId && !c.revokedAt);
  }

  revokeConsent(consentId: string): ConsentLedger {
    const consent = this.ledgers.find(c => c.id === consentId);
    if (!consent) {
      throw new NotFoundException('Consent not found');
    }
    if (consent.revokedAt) {
      return consent;
    }
    consent.revokedAt = new Date();
    return consent;
  }
}
