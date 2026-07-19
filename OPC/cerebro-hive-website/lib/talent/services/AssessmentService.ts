import { PrismaClient, Assessment, AssessmentVersion } from '@prisma/client';
import { AssessmentCompiler, CompiledAssessmentPackage } from '../compiler';
import { AssessmentSchema } from '../types';
import { TalentPolicyEngine } from '../auth/policy';

const prisma = new PrismaClient();
const compiler = new AssessmentCompiler();
const policy = new TalentPolicyEngine();

export class AssessmentService {
  
  async createDraft(workspaceId: string, title: string, userId: string): Promise<Assessment> {
    await policy.requireWorkspaceAccess(userId, workspaceId, 'CREATE_ASSESSMENT');
    
    return prisma.assessment.create({
      data: {
        workspaceId,
        title,
        status: "draft"
      }
    });
  }

  async compileAndPublish(assessmentId: string, draftSchema: AssessmentSchema, userId: string): Promise<AssessmentVersion> {
    const assessment = await prisma.assessment.findUniqueOrThrow({ where: { id: assessmentId } });
    await policy.requireWorkspaceAccess(userId, assessment.workspaceId, 'PUBLISH_ASSESSMENT');

    // 1. Compile through our robust Engine pipeline
    const compiledPackage = await compiler.compile(draftSchema, userId);
    
    // 2. Persist the immutable version
    return prisma.assessmentVersion.create({
      data: {
        assessmentId,
        versionNumber: compiledPackage.schema.version,
        manifestHash: compiledPackage.manifest.signatureHash,
        schemaPayload: compiledPackage.schema as any,
        manifestPayload: compiledPackage.manifest as any,
        createdByUserId: userId
      }
    });
  }

  async getVersions(assessmentId: string): Promise<AssessmentVersion[]> {
    return prisma.assessmentVersion.findMany({
      where: { assessmentId },
      orderBy: { versionNumber: 'desc' }
    });
  }
}
