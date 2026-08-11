import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8090),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().default("postgresql://cerebrohive:dev@127.0.0.1:5433/cerebro_platform"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  NATS_URL: z.string().default("nats://127.0.0.1:4222"),
  EVENT_BUS: z.enum(["memory", "redis", "nats"]).default("memory"),
  AGENTOS_URL: z.string().default("http://127.0.0.1:8088"),
  X_DEFAULT_PROVIDER: z.enum(["mock", "ollama", "openai", "anthropic"]).default("mock"),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OLLAMA_URL: z.string().default("http://127.0.0.1:11434"),
  PLATFORM_BOOTSTRAP_KEY: z.string().optional(),
  PUBLIC_BASE_URL: z.string().default("http://127.0.0.1:8090"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type PlatformConfig = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): PlatformConfig {
  return schema.parse(env);
}
