export interface TelemetryRecord {
  id: string;
  timestamp: Date;
  principalId: string;
  eventType: string; // e.g. Login, PolicyDeny, CredentialIssued
  severity: 'Info' | 'Warning' | 'Critical';
  metadata: Record<string, any>;
}

export interface TelemetryStore {
  saveRecord(record: TelemetryRecord): Promise<void>;
  getRecordsForPrincipal(principalId: string, since?: Date): Promise<TelemetryRecord[]>;
  queryRecords(eventType: string, since?: Date): Promise<TelemetryRecord[]>;
}

export class InMemoryTelemetryStore implements TelemetryStore {
  private records: TelemetryRecord[] = [];

  async saveRecord(record: TelemetryRecord): Promise<void> {
    this.records.push(record);
  }

  async getRecordsForPrincipal(principalId: string, since?: Date): Promise<TelemetryRecord[]> {
    return this.records.filter(r => 
      r.principalId === principalId && 
      (!since || r.timestamp >= since)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async queryRecords(eventType: string, since?: Date): Promise<TelemetryRecord[]> {
    return this.records.filter(r => 
      r.eventType === eventType && 
      (!since || r.timestamp >= since)
    );
  }
}
