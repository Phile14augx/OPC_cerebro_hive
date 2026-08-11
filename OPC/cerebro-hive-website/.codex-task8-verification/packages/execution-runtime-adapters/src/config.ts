/**
 * Phase 9g-1 — real, simple configuration for the production adapters in
 * this package. Deliberately minimal: reads from `process.env` with
 * explicit, documented defaults, no config-framework dependency. Nothing
 * here validates that the referenced Postgres database or NATS server is
 * actually reachable — that is exactly what this phase's adapters cannot
 * verify in this sandbox (see `ADR-046`'s "Not yet verified" section).
 */
export interface ExecutionRuntimeConfig {
  readonly postgresConnectionString: string;
  readonly natsUrl: string;
}

export function loadExecutionRuntimeConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env
): ExecutionRuntimeConfig {
  return {
    postgresConnectionString:
      env.EXECUTION_RUNTIME_POSTGRES_URL ?? 'postgres://localhost:5432/cerebro_execution_runtime',
    natsUrl: env.EXECUTION_RUNTIME_NATS_URL ?? env.NATS_URL ?? 'nats://localhost:4222',
  };
}
