/**
 * @cerebro/db — Knowledge (Collection + Document) Repositories
 */

import { type KnowledgeCollection, type KnowledgeDocument, type Prisma, prisma } from "../client/index.js";

// ── Collection repository ─────────────────────────────────────────────────────

export interface CreateCollectionInput {
  orgId:            string;
  name:             string;
  description?:     string;
  embeddingModel?:  string;
  chunkingStrategy?: string;
  chunkSize?:       number;
  chunkOverlap?:    number;
  createdById:      string;
}

export const collectionRepository = {
  async create(input: CreateCollectionInput): Promise<KnowledgeCollection> {
    return prisma.knowledgeCollection.create({
      data: {
        ...input,
        embeddingModel:  input.embeddingModel  ?? "text-embedding-3-small",
        chunkingStrategy: input.chunkingStrategy ?? "fixed",
        chunkSize:       input.chunkSize   ?? 512,
        chunkOverlap:    input.chunkOverlap ?? 64,
      },
    });
  },

  async findById(id: string, orgId: string): Promise<KnowledgeCollection | null> {
    return prisma.knowledgeCollection.findFirst({ where: { id, orgId } });
  },

  async findByIdOrThrow(id: string, orgId: string): Promise<KnowledgeCollection> {
    const col = await this.findById(id, orgId);
    if (!col) throw Object.assign(new Error(`Collection ${id} not found`), { code: "NOT_FOUND" });
    return col;
  },

  async list(orgId: string, options: {
    page?:  number;
    limit?: number;
  } = {}): Promise<{ items: KnowledgeCollection[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    const where = { orgId };

    const [items, total] = await Promise.all([
      prisma.knowledgeCollection.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.knowledgeCollection.count({ where }),
    ]);

    return { items, total };
  },

  // documentCount is not a schema field — KnowledgeCollection tracks documents via relations
  async getDocumentCount(id: string): Promise<number> {
    return prisma.knowledgeDocument.count({ where: { collectionId: id } });
  },

  async delete(id: string): Promise<void> {
    await prisma.knowledgeCollection.delete({ where: { id } });
  },
};

// ── Document repository ───────────────────────────────────────────────────────

export interface CreateDocumentInput {
  collectionId: string;
  orgId:        string;
  title:        string;   // required by schema
  sourceType:   string;
  sourceUrl?:   string;
  mimeType?:    string;
  contentHash:  string;   // required by schema
  metadata?:    Prisma.InputJsonValue;
  uploadedById: string;
}

export const documentRepository = {
  async create(input: CreateDocumentInput): Promise<KnowledgeDocument> {
    return prisma.knowledgeDocument.create({
      data: {
        ...input,
        status: "PENDING",
      },
    });
  },

  async findById(id: string, orgId: string): Promise<KnowledgeDocument | null> {
    return prisma.knowledgeDocument.findFirst({ where: { id, orgId } });
  },

  async findByIdOrThrow(id: string, orgId: string): Promise<KnowledgeDocument> {
    const doc = await this.findById(id, orgId);
    if (!doc) throw Object.assign(new Error(`Document ${id} not found`), { code: "NOT_FOUND" });
    return doc;
  },

  async updateStatus(
    id: string,
    status: string,
    extra?: {
      chunkCount?:       number;
      processingError?:  string;
      indexedAt?:        Date;
      extractedText?:    string;
    }
  ): Promise<KnowledgeDocument> {
    return prisma.knowledgeDocument.update({
      where: { id },
      data: {
        status: status as import("../client/index.js").DocumentStatus,
        ...(extra?.chunkCount      !== undefined && { chunkCount:      extra.chunkCount }),
        ...(extra?.processingError !== undefined && { processingError: extra.processingError }),
        ...(extra?.indexedAt       !== undefined && { indexedAt:       extra.indexedAt }),
        ...(extra?.extractedText   !== undefined && { extractedText:   extra.extractedText }),
      },
    });
  },

  async list(orgId: string, options: {
    collectionId?: string;
    status?:       string[];
    page?:         number;
    limit?:        number;
  } = {}): Promise<{ items: KnowledgeDocument[]; total: number }> {
    const { collectionId, status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.KnowledgeDocumentWhereInput = {
      orgId,
      ...(collectionId   && { collectionId }),
      ...(status?.length && { status: { in: status as Prisma.EnumDocumentStatusFilter["in"] } }),
    };

    const [items, total] = await Promise.all([
      prisma.knowledgeDocument.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.knowledgeDocument.count({ where }),
    ]);

    return { items, total };
  },

  async delete(id: string): Promise<void> {
    await prisma.knowledgeDocument.delete({ where: { id } });
  },
};
