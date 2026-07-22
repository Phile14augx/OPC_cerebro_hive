import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import swagger from "@fastify/swagger";
import { PlatformError, httpStatus } from "../errors/errors.js";
import type { Platform } from "../../app/container.js";
import type { RequestContext } from "../context/context.js";
import { newId } from "../ids/id.js";
import { registerRoutes } from "./routes.js";

declare module "fastify" {
  interface FastifyRequest { ctx?: RequestContext }
}

const PUBLIC_PATHS = new Set(["/health", "/ready", "/openapi.json", "/v1/bootstrap", "/docs"]);

export async function createServer(platform: Platform): Promise<FastifyInstance> {
  const app = Fastify({ logger: false, bodyLimit: 8 * 1024 * 1024 });

  // Tolerate POST/PUT/PATCH requests sent with a `content-type: application/json`
  // header but an empty body (common for action-style endpoints like deprovision
  // or generate-invoice that take no payload) — treat empty body as `{}` instead
  // of the Fastify default of rejecting it outright.
  app.addContentTypeParser("application/json", { parseAs: "string" }, (_req, body, done) => {
    if (!body || (typeof body === "string" && body.trim().length === 0)) { done(null, {}); return; }
    try { done(null, JSON.parse(body as string)); } catch (err) { done(err as Error, undefined); }
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "CerebroHive Enterprise AI OS",
        description: "Cerebro X gateway, AgentOS runtime, Reasoning, Mesh, Flow, Memory & Knowledge Fabric, Context, Guard, Eval, Observatory, Governance, Connect, Hub, Simulator, Sphere.",
        version: "0.1.0",
      },
      components: { securitySchemes: { apiKey: { type: "http", scheme: "bearer", description: "Platform API key (chk_...)" } } },
      security: [{ apiKey: [] }],
    },
  });

  app.addHook("onRequest", async (req: FastifyRequest, reply: FastifyReply) => {
    const path = req.url.split("?")[0]!;
    if (PUBLIC_PATHS.has(path) || path.startsWith("/v1/connect/webhooks/")) return;
    const auth = req.headers.authorization;
    const key = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
    if (!key) { await reply.code(401).send({ error: { code: "unauthorized", message: "missing bearer api key" } }); return reply; }
    try {
      const principal = await platform.identity.authenticate(key);
      req.ctx = { principal, requestId: newId("req"), traceId: newId("trc") };
    } catch {
      await reply.code(401).send({ error: { code: "unauthorized", message: "invalid api key" } });
      return reply;
    }
    const allowed = await platform.guard.enforceRateLimit(req.ctx!, path.split("/").slice(0, 3).join("/"), 300, 60_000);
    if (!allowed) { await reply.code(429).send({ error: { code: "rate_limited", message: "too many requests" } }); return reply; }
  });

  app.setErrorHandler(async (rawErr, _req, reply) => {
    const err = rawErr as Error & { validation?: unknown };
    if (err instanceof PlatformError) {
      platform.telemetry.metrics.increment("http.error", 1, { code: err.code });
      await reply.code(httpStatus(err.code)).send({ error: { code: err.code, message: err.message, details: err.details ?? null, retryable: err.retryable } });
      return;
    }
    if (err.validation) {
      await reply.code(400).send({ error: { code: "validation", message: err.message } });
      return;
    }
    platform.logger.error({ err: err.message, stack: err.stack?.slice(0, 500) }, "unhandled error");
    platform.telemetry.metrics.increment("http.error", 1, { code: "internal" });
    await reply.code(500).send({ error: { code: "internal", message: "internal error" } });
  });

  app.get("/health", async () => ({ status: "ok", service: "cerebro-platform", at: new Date().toISOString() }));
  app.get("/ready", async () => {
    const checks: Record<string, boolean> = { bus: true, db: true };
    try { if (platform.db) await platform.db.selectFrom("organizations").select("id").limit(1).execute(); }
    catch { checks.db = false; }
    const ready = Object.values(checks).every(Boolean);
    return { ready, checks, bus: platform.bus.kind };
  });
  app.get("/openapi.json", async () => app.swagger());

  app.post("/v1/bootstrap", async (req, reply) => {
    const body = (req.body ?? {}) as { name?: string; slug?: string; ownerEmail?: string; ownerName?: string; bootstrapKey?: string };
    if (platform.config.PLATFORM_BOOTSTRAP_KEY && body.bootstrapKey !== platform.config.PLATFORM_BOOTSTRAP_KEY) {
      await reply.code(403).send({ error: { code: "forbidden", message: "invalid bootstrap key" } });
      return;
    }
    if (!body.name || !body.slug || !body.ownerEmail) {
      await reply.code(400).send({ error: { code: "validation", message: "name, slug, ownerEmail required" } });
      return;
    }
    const result = await platform.identity.bootstrapOrganization({
      name: body.name, slug: body.slug, ownerEmail: body.ownerEmail, ownerName: body.ownerName ?? body.ownerEmail,
    });
    await platform.bus.publish("platform.organization.created", { organizationId: result.organization.id, slug: result.organization.slug }, { organizationId: result.organization.id });
    return {
      organization: result.organization,
      workspace: result.workspace,
      apiKey: { id: result.apiKey.id, secret: result.apiKey.secret, note: "store this secret now; it is not shown again" },
    };
  });

  registerRoutes(app, platform);
  return app;
}
