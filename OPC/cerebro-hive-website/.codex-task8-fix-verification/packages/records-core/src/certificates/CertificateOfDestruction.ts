export interface CertificateOfDestruction {
  certificateId: string;
  recordId: string;
  scheduleId: string;
  
  approvers: string[];
  deletionAcknowledgements: string[]; // Systems that confirmed deletion
  
  destroyedAt: Date;
  ledgerEntryRef: string; // Link back to the Audit Ledger
}
