export class AnonymizationJob {
  id: string;
  strategy: string;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  rowsAffected?: number;
}
