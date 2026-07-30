import { IReviewContributor } from '../ports/IReviewContributor';
import { SecurityReviewAgent } from './security/SecurityReviewAgent';
import { CostReviewAgent } from './cost/CostReviewAgent';
import { ComplianceReviewAgent } from './compliance/ComplianceReviewAgent';
import { ReliabilityReviewAgent } from './reliability/ReliabilityReviewAgent';
import { ArchitectureReviewContributor } from '../infrastructure/ArchitectureReviewContributor';

export class ContributorRegistry {
  private readonly contributors: IReviewContributor[] = [];

  constructor() {
    this.contributors.push(new SecurityReviewAgent());
    this.contributors.push(new CostReviewAgent());
    this.contributors.push(new ComplianceReviewAgent());
    this.contributors.push(new ReliabilityReviewAgent());
    this.contributors.push(new ArchitectureReviewContributor());
  }

  getEnabled(): IReviewContributor[] {
    return this.contributors;
  }
}
