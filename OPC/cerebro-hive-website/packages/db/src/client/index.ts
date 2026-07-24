/**
 * @cerebro/db — Prisma client singleton
 * Configures the client with OTel instrumentation, query logging,
 * and soft-delete middleware.
 */

import { PrismaClient } from "../generated/client/index.js";

// ── Instrumented client factory ───────────────────────────────────────────────

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { emit: "event", level: "query"  },
      { emit: "event", level: "warn"   },
      { emit: "event", level: "error"  },
    ],
    errorFormat: "minimal",
  });

  // ── Query logging (only in non-production) ────────────────────────────────
  if (process.env["NODE_ENV"] !== "production") {
    client.$on("query", (e) => {
      if (e.duration > 100) {
        console.warn(`[db:slow] ${e.duration}ms — ${e.query.slice(0, 200)}`);
      }
    });
  }

  client.$on("error", (e) => {
    console.error("[db:error]", e.message);
  });

  // ── Soft-delete middleware ─────────────────────────────────────────────────
  // Intercepts delete operations on entities that have soft-delete semantics
  client.$use(async (params, next) => {
    const softDeleteModels = ["User", "Organization", "Agent", "KnowledgeDocument"];

    if (params.action === "delete" && softDeleteModels.includes(params.model ?? "")) {
      params.action = "update";
      params.args["data"] = { status: "DELETED", updatedAt: new Date() };
    }

    if (params.action === "deleteMany" && softDeleteModels.includes(params.model ?? "")) {
      params.action = "updateMany";
      if (params.args["data"] !== undefined) {
        params.args["data"]["status"] = "DELETED";
      } else {
        params.args["data"] = { status: "DELETED" };
      }
    }

    return next(params);
  });

  // ── Auto-exclude soft-deleted records ─────────────────────────────────────
  client.$use(async (params, next) => {
    const softDeleteModels = ["User", "Organization", "Agent"];

    if (
      ["findUnique", "findFirst", "findMany"].includes(params.action) &&
      softDeleteModels.includes(params.model ?? "")
    ) {
      params.args ??= {};
      params.args["where"] ??= {};
      if (!("status" in params.args["where"])) {
        params.args["where"]["status"] = { not: "DELETED" };
      }
    }

    return next(params);
  });

  return client;
}

// ── Global singleton (prevents connection pool exhaustion during hot-reload) ──

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}

process.on("beforeExit", () => {
  void disconnectDb();
});

export { PrismaClient };
export * from "../generated/client/index.js";
