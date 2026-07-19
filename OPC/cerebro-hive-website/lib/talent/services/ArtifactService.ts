import { PrismaClient, AssessmentResource } from '@prisma/client';

const prisma = new PrismaClient();

export class ArtifactService {
  
  /**
   * Registers a new resource in the database and returns an upload URL for Object Storage (S3/MinIO)
   */
  async registerResource(assessmentId: string, name: string, type: string): Promise<{ resource: AssessmentResource, uploadUrl: string }> {
    const storageKey = `talent-os/${assessmentId}/resources/${Date.now()}_${name.replace(/\s+/g, '_')}`;
    
    const resource = await prisma.assessmentResource.create({
      data: {
        assessmentId,
        name,
        type,
        storageKey
      }
    });

    // Mock AWS S3 Presigned URL Generation
    const uploadUrl = `https://mock-s3-bucket.localhost/${storageKey}?signature=xyz`;

    return { resource, uploadUrl };
  }

  /**
   * Resolves a storage key to a secure download URL
   */
  async getDownloadUrl(storageKey: string): Promise<string> {
    return `https://mock-s3-bucket.localhost/${storageKey}?expires=3600`;
  }
}
