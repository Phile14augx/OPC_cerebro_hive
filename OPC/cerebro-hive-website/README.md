# Cerebro Hive Studio

This repository contains the Cerebro Studio frontend application, which consumes the Engineering Review API (M26.2 Baseline).

## Architecture

- **Transport & APIs**: REST via `@cerebro/api-client`, driven by Zod-based OpenAPI generation (ADR-012, ADR-013).
- **Identity**: AWS Cognito as the reference Identity Provider implementation (ADR-014).
- **Observability**: OpenTelemetry for tracing and structured JSON logging (ADR-015).
- **Infrastructure**: AWS Lambda, DynamoDB, Amazon S3, and Amazon SNS (ADR-016).

## Configuration

Studio requires the `NEXT_PUBLIC_API_URL` environment variable to be set to point to the live Engineering Review API endpoints.
Please copy `apps/studio/.env.example` to `apps/studio/.env.local` to configure your environment.

See ADRs in the architecture governance documents for more details.
