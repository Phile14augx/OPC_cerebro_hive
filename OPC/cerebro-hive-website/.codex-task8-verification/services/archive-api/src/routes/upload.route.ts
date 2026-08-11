import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { generatePresignedUploadUrl } from '../services/storage.service.js';

const uploadRequestSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  tenantId: z.string(),
});

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/uploads',
    {
      schema: {
        body: uploadRequestSchema,
        response: {
          201: z.object({
            uploadId: z.string(),
            documentId: z.string(),
            versionId: z.string(),
            uploadUrl: z.string(),
            expiresAt: z.string(),
            requiredHeaders: z.record(z.string()),
          }),
        },
      },
    },
    async (request, reply) => {
      const { filename, contentType, tenantId } = request.body as z.infer<typeof uploadRequestSchema>;

      const documentId = `doc_${Math.random().toString(36).substring(7)}`;
      const versionId = `ver_1`;
      const uploadId = `upl_${Math.random().toString(36).substring(7)}`;

      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const storageKey = `${tenantId}/${documentId}/${versionId}/original/${sanitizedFilename}`;

      const uploadUrl = await generatePresignedUploadUrl(storageKey, contentType);
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

      return reply.status(201).send({
        uploadId,
        documentId,
        versionId,
        uploadUrl,
        expiresAt,
        requiredHeaders: {
          'content-type': contentType,
        },
      });
    }
  );
}
