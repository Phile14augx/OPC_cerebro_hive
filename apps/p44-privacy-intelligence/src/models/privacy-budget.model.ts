export class PrivacyBudget {
  id: string;
  datasetId: string;
  epsilonTotal: number;
  epsilonUsed: number;
  deltaTotal: number;
  deltaUsed: number;
  updatedAt: Date;
}
