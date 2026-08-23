import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/generated/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma 7's generated client uses the WASM query compiler, which requires
// a driver adapter (no classic binary/library query engine fallback) --
// see https://pris.ly/d/driver-adapters. The adapter wraps a `pg.Pool` and
// connects lazily, so constructing it here is safe even when DATABASE_URL
// is unset (e.g. during a build/typecheck pass that never issues a query).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from './src/generated/client';

export * from './src/repositories/context';
export * from './src/repositories/BaseRepository';
export * from './src/repositories/TenantRepository';
export * from './src/repositories/WorkspaceRepository';
export * from './src/repositories/UserRepository';
export * from './src/repositories/AgentRepository';
export * from './src/repositories/AgentConversationRepository';
export * from './src/repositories/ToolRepository';
export * from './src/repositories/PrismaExecutionStore';
export * from './src/repositories/WorkflowRepository';
export * from './src/repositories/KnowledgeRepository';
export * from './src/repositories/ProjectRepository';
export * from './src/repositories/AuditRepository';
export * from './src/repositories/OutboxRepository';
export * from './src/repositories/IdempotencyRepository';
export * from './src/repositories/ApiKeyRepository';
export * from './src/repositories/TalentAuthorizationRepository';
export * from './src/transactions/PrismaUnitOfWork';
export * from './src/twin-studio/twin-repository';
export * from './src/auth/talent-permissions';



