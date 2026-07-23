import { Document, DocumentVersion } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export class KnowledgeRepository extends BaseRepository {
  async registerDocument(title: string, options: IRepositoryOptions): Promise<Document> {
    const db = this.getClient(options);
    return db.document.create({
      data: { title }
    });
  }

  async publishDocumentVersion(documentId: string, content: string, chunks: { text: string }[], options: IRepositoryOptions): Promise<DocumentVersion> {
    const db = this.getClient(options);
    
    const latest = await db.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' }
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    return db.documentVersion.create({
      data: {
        documentId,
        version: nextVersion,
        content,
        chunks: {
          create: chunks.map(c => ({
            content: c.text,
          }))
        }
      }
    });
  }
}
