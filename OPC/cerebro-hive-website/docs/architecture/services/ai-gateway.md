```yaml
name: packages/ai-gateway
language: TypeScript
framework: none (plain library)
entrypoint: src/index.ts (AIGateway class)
protocol: in-process (imported, not networked)
deployment: bundled into apps/platform-api
consumes:
  - Anthropic API
  - OpenAI API
produces:
  - chat()
  - stream()
health: getHealth() method (circuit-breaker state per provider)
owner: unknown
confidence: verified
duplicate: None — LLM provider gateway, distinct responsibility from services/gateway (edge proxy).
status: >
  Real, built/verified this session (M10/M25). Circuit breaker, rate limiter, response cache, cost tracking all genuine.
notes: >
  (none)
```
