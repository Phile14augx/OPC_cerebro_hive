/**
 * platform-api — Express application factory
 * Registers all middleware, routes, and OpenAPI spec.
 */

import express, { type Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import { getPlatformApiConfig } from "@cerebro/config";
import { optionalAuth } from "@cerebro/auth";
import { errorHandler, notFoundHandler } from "@cerebro/errors";

import { authRouter }        from "./routes/auth.js";
import { orgsRouter }        from "./routes/orgs.js";
import { workflowsRouter }   from "./routes/workflows.js";
import { agentsRouter }      from "./routes/agents.js";
import { knowledgeRouter }   from "./routes/knowledge.js";
import { aiRouter }          from "./routes/ai.js";
import { billingRouter }     from "./routes/billing.js";
import { apiKeysRouter }     from "./routes/api-keys.js";
import { adminRouter }       from "./routes/admin.js";
import { healthRouter }      from "./routes/health.js";
import { promptsRouter }     from "./routes/prompts.js";
import { evaluationsRouter } from "./routes/evaluations.js";
import { tracesRouter }      from "./routes/traces.js";
import { modelsRouter }      from "./routes/models.js";
import { requestLogger }     from "./middleware/request-logger.js";

export function createApp(): Application {
  const cfg = getPlatformApiConfig();
  const app = express();

  // ── Security ────────────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'"],
        objectSrc:  ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
  }));

  app.use(cors({
    origin:      cfg.CORS_ORIGINS.split(",").map(s => s.trim()),
    credentials: true,
    methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key", "X-Trace-ID", "X-Request-ID"],
    exposedHeaders: ["X-Trace-ID", "X-Request-ID", "X-RateLimit-Remaining"],
  }));

  // ── Compression + parsing ───────────────────────────────────────────────────
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ── Rate limiting ───────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: cfg.RATE_LIMIT_WINDOW_MS,
    max:      cfg.RATE_LIMIT_MAX,
    standardHeaders: "draft-7",
    legacyHeaders:   false,
    skip: (req) => req.path === "/health" || req.path === "/metrics",
    keyGenerator: (req) => {
      // Prefer authenticated user ID over IP for better granularity
      return (req as express.Request & { auth?: { userId: string } }).auth?.userId ?? req.ip ?? "unknown";
    },
  });
  app.use(limiter);

  // ── Observability ───────────────────────────────────────────────────────────
  app.use(requestLogger);

  // ── Auth (optional — routes enforce as needed) ──────────────────────────────
  app.use(optionalAuth);

  // ── Routes ──────────────────────────────────────────────────────────────────
  app.use("/health",              healthRouter);
  app.use("/v1/auth",             authRouter);
  app.use("/v1/orgs",             orgsRouter);
  app.use("/v1/workflows",        workflowsRouter);
  app.use("/v1/agents",           agentsRouter);
  app.use("/v1/knowledge",        knowledgeRouter);
  app.use("/v1/ai",               aiRouter);
  app.use("/v1/billing",          billingRouter);
  app.use("/v1/api-keys",         apiKeysRouter);
  app.use("/v1/admin",            adminRouter);
  app.use("/v1/prompts",          promptsRouter);
  app.use("/v1/evaluations",      evaluationsRouter);
  app.use("/v1/traces",           tracesRouter);
  app.use("/v1/models",           modelsRouter);

  // ── Error handling ──────────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
