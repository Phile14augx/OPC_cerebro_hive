import { PrismaClient, Assessment, AssessmentVersion } from '@prisma/client';
import { AssessmentCompiler, CompiledAssessmentPackage } from '../compiler';
import { AssessmentSchema } from '../types';
import { TalentPolicyEngine } from '../auth/policy';
import { withTransaction } from '../infrastructure/database/transaction';
import { DomainEventBus } from '../infrastructure/events/eventBus';

const prisma = new PrismaClient();
const compiler = new AssessmentCompiler();
const policy = new TalentPolicyEngine();

export interface AssessmentPaginationParams {
  workspaceId: string;
  skip?: number;
  take?: number;
  status?: string;
}

export class AssessmentService {
  
  async listAssessments(params: AssessmentPaginationParams): Promise<{ data: Assessment[], total: number }> {
    const { workspaceId, skip = 0, take = 10, status } = params;

    const where = {
      workspaceId,
      ...(status && { status })
    };

    const [data, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.assessment.count({ where })
    ]);

    return { data, total };
  }

  async getAssessmentById(id: string): Promise<Assessment | null> {
    return prisma.assessment.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });
  }

  async createDraft(workspaceId: string, title: string, userId: string, traceId?: string): Promise<Assessment> {
    await policy.requireWorkspaceAccess(userId, workspaceId, 'CREATE_ASSESSMENT');
    
    return withTransaction(async (tx) => {
      const assessment = await tx.assessment.create({
        data: {
          workspaceId,
          title,
          status: "draft"
        }
      });

      // Domain Event
      DomainEventBus.publish('AssessmentPublished', { assessmentId: assessment.id, action: 'created' }, traceId);
      
      return assessment;
    });
  }

  async compileAndPublish(assessmentId: string, draftSchema: AssessmentSchema, userId: string, traceId?: string): Promise<AssessmentVersion> {
    const assessment = await prisma.assessment.findUniqueOrThrow({ where: { id: assessmentId } });
    await policy.requireWorkspaceAccess(userId, assessment.workspaceId, 'PUBLISH_ASSESSMENT');

    // 1. Compile through our robust Engine pipeline
    const compiledPackage = await compiler.compile(draftSchema, userId);
    
    return withTransaction(async (tx) => {
      // 2. Persist the immutable version
      const version = await tx.assessmentVersion.create({
        data: {
          assessmentId,
          versionNumber: compiledPackage.schema.version,
          manifestHash: compiledPackage.manifest.signatureHash,
          schemaPayload: compiledPackage.schema as any,
          manifestPayload: compiledPackage.manifest as any,
          createdByUserId: userId
        }
      });

      // Update parent status
      await tx.assessment.update({
        where: { id: assessmentId },
        data: { status: "published" }
      });

      // 3. Fire Domain Event explicitly
      DomainEventBus.publish('AssessmentPublished', {
        assessmentId,
        versionId: version.id,
        versionNumber: version.versionNumber
      }, traceId);

      return version;
    });
  }

  async getVersions(assessmentId: string): Promise<AssessmentVersion[]> {
    return prisma.assessmentVersion.findMany({
      where: { assessmentId },
      orderBy: { versionNumber: 'desc' }
    });
  }
}
