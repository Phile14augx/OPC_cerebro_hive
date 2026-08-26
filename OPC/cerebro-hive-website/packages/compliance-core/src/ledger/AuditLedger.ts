import { createHash } from 'crypto';

export type RetentionClass = 'Operational_90Days' | 'Audit_7Years' | 'Financial_10Years' | 'LegalHold_Indefinite';

export interface LedgerEntry {
  entryId: string;
  timestamp: Date;
  actor: string;
  eventType: string;
  payloadHash: string;
  previousHash: string;
  entryHash: string;
  schemaVersion: string;
  retentionClass: RetentionClass;
  payload: unknown; // The raw payload, stored alongside but verified via hash
}

export class AuditLedger {
  private chain: LedgerEntry[] = [];
  private genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

  /**
   * Appends an event to the immutable ledger.
   */
  async append(actor: string, eventType: string, payload: unknown, retention: RetentionClass = 'Audit_7Years'): Promise<LedgerEntry> {
    const previousHash = this.chain.length > 0 ? this.chain[this.chain.length - 1].entryHash : this.genesisHash;
    const payloadStr = JSON.stringify(payload);
    const payloadHash = createHash('sha256').update(payloadStr).digest('hex');
    
    const timestamp = new Date();
    const entryId = `ledg-${Date.now()}`;
    const schemaVersion = 'v1';

    // Hash the entry components together (excluding the raw payload itself)
    const entryData = `${entryId}:${timestamp.toISOString()}:${actor}:${eventType}:${payloadHash}:${previousHash}:${schemaVersion}:${retention}`;
    const entryHash = createHash('sha256').update(entryData).digest('hex');

    const entry: LedgerEntry = {
      entryId,
      timestamp,
      actor,
      eventType,
      payloadHash,
      previousHash,
      entryHash,
      schemaVersion,
      retentionClass: retention,
      payload
    };

    this.chain.push(entry);
    console.log(`[AuditLedger] 🔗 Appended block ${entry.entryId} (Hash: ${entryHash.substring(0,8)}...)`);
    return entry;
  }

  /**
   * Cryptographically verifies the entire ledger chain.
   */
  verifyChain(): boolean {
    for (let i = 0; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previousHash = i === 0 ? this.genesisHash : this.chain[i - 1].entryHash;

      if (current.previousHash !== previousHash) return false;

      // Verify payload
      const calculatedPayloadHash = createHash('sha256').update(JSON.stringify(current.payload)).digest('hex');
      if (calculatedPayloadHash !== current.payloadHash) return false;

      // Verify entry
      const entryData = `${current.entryId}:${current.timestamp.toISOString()}:${current.actor}:${current.eventType}:${current.payloadHash}:${current.previousHash}:${current.schemaVersion}:${current.retentionClass}`;
      const calculatedEntryHash = createHash('sha256').update(entryData).digest('hex');
      
      if (calculatedEntryHash !== current.entryHash) return false;
    }

    return true;
  }

  getEntries(): LedgerEntry[] {
    return [...this.chain];
  }
}
