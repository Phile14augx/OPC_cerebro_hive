import { Module } from '@nestjs/common';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';
import { PolicyService } from './services/policy.service';
import { ProvenanceService } from './services/provenance.service';
import { ApprovalWorkflowService } from './services/approval-workflow.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GovernanceController],
  providers: [
    GovernanceService,
    PolicyService,
    ProvenanceService,
    ApprovalWorkflowService,
    PrismaService
  ],
  exports: [
    GovernanceService,
    PolicyService,
    ProvenanceService,
    ApprovalWorkflowService
  ]
})
export class GovernanceModule {}
