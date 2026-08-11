# @cerebro/ai

## Purpose
Provides a unified AI inference gateway for the CerebroHive platform, abstracting away third-party provider SDKs to enforce standardized prompting, tool usage, and error handling.

## Public API
- `AIService`
- `AIGenerateRequest`, `AIServiceConfig`

## Dependencies
- `@cerebro/contracts`
- `@cerebro/telemetry`
- `ai` (Vercel AI SDK - Internal implementation detail)

## Consumers
- `apps/forge`
- `apps/studio`
- `packages/workflow`

## Out of Scope
- Prompt engineering or agent persona definitions (belongs in `apps/forge`)
- Exposing provider-specific features to consumers (e.g. leaking raw OpenAI config parameters to the UI)
- Managing database state for conversation history (belongs to individual products via `@cerebro/database`)
