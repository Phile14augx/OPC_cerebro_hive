import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';

export * from './src/repositories/context';
export * from './src/repositories/BaseRepository';
export * from './src/repositories/TenantRepository';
export * from './src/repositories/WorkspaceRepository';
export * from './src/repositories/UserRepository';
export * from './src/repositories/AgentRepository';
export * from './src/repositories/ToolRepository';
export * from './src/repositories/WorkflowRepository';
export * from './src/repositories/KnowledgeRepository';
export * from './src/repositories/ProjectRepository';
export * from './src/repositories/AuditRepository';
export * from './src/repositories/OutboxRepository';
export * from './src/repositories/IdempotencyRepository';
export * from './src/transactions/PrismaUnitOfWork';



