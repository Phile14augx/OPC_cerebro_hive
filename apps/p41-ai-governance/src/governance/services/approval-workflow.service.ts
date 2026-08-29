import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ApprovalWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async createWorkflow(resourceId: string, workflowType: string) {
    return this.prisma.approvalWorkflow.create({
      data: {
        resourceId,
        workflowType,
        status: 'pending_review',
      },
    });
  }

  async transitionState(workflowId: string, newState: 'approved' | 'rejected', justification?: string) {
    const workflow = await this.prisma.approvalWorkflow.findUnique({ where: { id: workflowId } });
    if (!workflow) {
      throw new BadRequestException('Workflow not found');
    }

    if (workflow.status !== 'pending_review') {
      throw new BadRequestException(`Cannot transition from ${workflow.status}`);
    }

    return this.prisma.approvalWorkflow.update({
      where: { id: workflowId },
      data: {
        status: newState,
        justification,
      },
    });
  }
}
