```yaml
name: services/gateway
language: Rust
framework: Axum + Tokio
entrypoint: src/main.rs
protocol: HTTP
deployment: standalone binary (Dockerfile present)
consumes:
  - platform_svc_url (Kotlin)
  - academy_svc_url (Kotlin)
  - crm_svc_url (Kotlin)
  - platform_api_url (TS, apps/platform-api)
  - forge_api_url (TS, services/forge-api)
produces:
  - /api/v1/platform/*
  - /api/v1/academy/*
  - /api/v1/crm/*
  - /api/v1/workflows/*
  - /api/v1/agents/*
  - /api/v1/knowledge/*
  - /api/v1/forge/*
health: /health, /ready
owner: unknown (no CODEOWNERS in repo)
confidence: verified
duplicate: None — this is an edge reverse-proxy, a different responsibility from packages/ai-gateway (LLM provider routing).
status: >
  Real, mostly working. One confirmed bug: the "/" mount route (as opposed to "/{*path}") hardcodes an empty base_url placeholder instead of the captured one, breaking root-path proxying for every mounted service.
notes: >
  This is the actual front door: it proxies to apps/platform-api, confirming platform-api is reached through this gateway in the intended architecture, not directly.
```
