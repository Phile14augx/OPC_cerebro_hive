export class ConsentLedger {
  id: string;
  userId: string;
  purpose: string;
  lawfulBasis: string;
  grantedAt: Date;
  revokedAt?: Date;
  metadata?: any;
}
