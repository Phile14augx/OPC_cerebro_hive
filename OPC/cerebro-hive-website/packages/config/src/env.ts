/**
 * @cerebro/config — Zod-validated environment configuration
 * Import the service-specific config object; it will throw at startup
 * (not silently at runtime) if any required variable is missing or invalid.
 */

import { z, type ZodTypeAny } from "zod";

// ── Helper ────────────────────────────────────────────────────────────────────

/** Parse `process.env` against a Zod schema; throw if invalid */
function parseEnv<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map(i => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`[config] Environment validation failed:\n${issues}`);
  }
  return result.data;
}

// ── Shared base ───────────────────────────────────────────────────────────────

const BaseEnvSchema = z.object({
  NODE_ENV:    z.enum(["development", "staging", "production", "test"]).default("development"),
  LOG_LEVEL:   z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  PORT:        z.coerce.number().int().min(1).max(65535).default(4000),

  // Database
  DATABASE_URL:          z.string().url(),
  DATABASE_POOL_MIN:     z.coerce.number().int().min(1).default(2),
  DATABASE_POOL_MAX:     z.coerce.number().int().min(1).default(10),

  // NATS
  NATS_URL:              z.string().url().default("nats://localhost:4222"),
  NATS_CREDENTIALS:      z.string().optional(),

  // Redis
  REDIS_URL:             z.string().url().default("redis://localhost:6379"),

  // Keycloak / Auth
  KEYCLOAK_SERVER_URL:   z.string().url(),
  KEYCLOAK_REALM:        z.string().min(1),
  KEYCLOAK_CLIENT_ID:    z.string().min(1),
  KEYCLOAK_CLIENT_SECRET: z.string().min(1),
  JWT_ALGORITHM:         z.string().default("RS256"),

  // OpenTelemetry
  OTEL_SERVICE_NAME:     z.string().min(1),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().default("http://otel-collector:4318"),
  OTEL_TRACES_SAMPLER_ARG:     z.coerce.number().min(0).max(1).default(0.1),
  OTEL_ENABLED:          z.coerce.boolean().default(true),

  // Cors
  CORS_ORIGINS:          z.string().default("http://localhost:3000,http://localhost:3001"),

  // Feature flags
  FLAGD_HOST:            z.string().default("flagd"),
  FLAGD_PORT:            z.coerce.number().int().default(8013),
});

export type BaseEnv = z.infer<typeof BaseEnvSchema>;

// ── Platform API config ───────────────────────────────────────────────────────

const PlatformApiEnvSchema = BaseEnvSchema.extend({
  OTEL_SERVICE_NAME:    z.string().default("platform-api"),
  PORT:                 z.coerce.number().default(4000),

  // Temporal
  TEMPORAL_ADDRESS:     z.string().default("temporal-frontend:7233"),
  TEMPORAL_NAMESPACE:   z.string().default("cerebro-hive"),
  TEMPORAL_TASK_QUEUE:  z.string().default("cerebro-workflows"),

  // AI gateway
  AI_GATEWAY_URL:       z.string().url().default("http://ai-gateway:4010"),

  // Billing
  STRIPE_SECRET_KEY:    z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // S3 / storage
  AWS_REGION:           z.string().default("us-east-1"),
  S3_BUCKET_DOCUMENTS:  z.string().default("cerebro-hive-documents"),
  S3_BUCKET_ARTIFACTS:  z.string().default("cerebro-hive-artifacts"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS:  z.coerce.number().default(60_000),
  RATE_LIMIT_MAX:        z.coerce.number().default(100),
});

// ── Forge API config ──────────────────────────────────────────────────────────

const ForgeApiEnvSchema = BaseEnvSchema.extend({
  OTEL_SERVICE_NAME:   z.string().default("forge-api"),
  PORT:                z.coerce.number().default(4001),
  TEMPORAL_ADDRESS:    z.string().default("temporal-frontend:7233"),
  TEMPORAL_NAMESPACE:  z.string().default("cerebro-hive"),
  TEMPORAL_TASK_QUEUE: z.string().default("cerebro-workflows"),
  AI_GATEWAY_URL:      z.string().url().default("http://ai-gateway:4010"),
  MAX_CONCURRENT_WORKFLOWS: z.coerce.number().int().default(50),
  SSE_HEARTBEAT_MS:    z.coerce.number().default(15_000),
});

// ── AI Gateway config ─────────────────────────────────────────────────────────

const AIGatewayEnvSchema = BaseEnvSchema.extend({
  OTEL_SERVICE_NAME: z.string().default("ai-gateway"),
  PORT:              z.coerce.number().default(4010),

  // Provider API keys
  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY:    z.string().optional(),
  COHERE_API_KEY:    z.string().optional(),

  // Caching
  SEMANTIC_CACHE_ENABLED:     z.coerce.boolean().default(true),
  SEMANTIC_CACHE_TTL_SECONDS: z.coerce.number().default(3600),
  SEMANTIC_CACHE_THRESHOLD:   z.coerce.number().min(0).max(1).default(0.95),

  // Rate limiting per provider
  ANTHROPIC_RPM:  z.coerce.number().default(1000),
  OPENAI_RPM:     z.coerce.number().default(3000),

  // Fallback chain
  FALLBACK_ENABLED: z.coerce.boolean().default(true),
  FALLBACK_CHAIN:   z.string().default("claude-sonnet-4-6,gpt-4o"),
});

// ── Studio (Next.js) config ───────────────────────────────────────────────────

const StudioEnvSchema = z.object({
  NODE_ENV:                z.enum(["development", "staging", "production", "test"]).default("development"),
  NEXT_PUBLIC_API_URL:     z.string().url(),
  NEXT_PUBLIC_FORGE_URL:   z.string().url(),
  NEXT_PUBLIC_AUTH_URL:    z.string().url(),
  NEXT_PUBLIC_KEYCLOAK_REALM:     z.string().min(1),
  NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: z.string().min(1),
  NEXT_PUBLIC_SENTRY_DSN:  z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_FLAGD_URL:   z.string().url().optional(),
});

// ── Parsed singletons (lazy — only parse when service imports) ────────────────

let _platformApiConfig: z.infer<typeof PlatformApiEnvSchema> | null = null;
let _forgeApiConfig:    z.infer<typeof ForgeApiEnvSchema>    | null = null;
let _aiGatewayConfig:   z.infer<typeof AIGatewayEnvSchema>   | null = null;
let _studioConfig:      z.infer<typeof StudioEnvSchema>      | null = null;

export function getPlatformApiConfig() {
  return (_platformApiConfig ??= parseEnv(PlatformApiEnvSchema));
}

export function getForgeApiConfig() {
  return (_forgeApiConfig ??= parseEnv(ForgeApiEnvSchema));
}

export function getAIGatewayConfig() {
  return (_aiGatewayConfig ??= parseEnv(AIGatewayEnvSchema));
}

export function getStudioConfig() {
  return (_studioConfig ??= parseEnv(StudioEnvSchema));
}

/** Reset cached configs (useful in tests) */
export function resetConfig(): void {
  _platformApiConfig = null;
  _forgeApiConfig    = null;
  _aiGatewayConfig   = null;
  _studioConfig      = null;
}

export type PlatformApiConfig = z.infer<typeof PlatformApiEnvSchema>;
export type ForgeApiConfig    = z.infer<typeof ForgeApiEnvSchema>;
export type AIGatewayConfig   = z.infer<typeof AIGatewayEnvSchema>;
export type StudioConfig      = z.infer<typeof StudioEnvSchema>;
