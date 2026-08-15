# Local Development

From `OPC/cerebro-hive-website`:

```bash
cp .env.example .env
docker compose --profile core up -d
pnpm install
pnpm prisma:generate
pnpm --filter @cerebro/db exec prisma migrate deploy
pnpm --filter @cerebro/forge-api dev
pnpm --filter @cerebro/studio dev
pnpm --filter @cerebro/platform-api dev
```

Studio: http://localhost:3401/app  
forge-api health: http://localhost:4005/health  
platform-api: http://localhost:3406/health  
Nexarch OS: http://localhost:3410 (`pnpm --filter @cerebro/nexarch-os dev`) — see [nexarch-os-bootstrap.md](../operations/runbooks/nexarch-os-bootstrap.md).  

`KEYCLOAK_SERVER_URL` is required for JWT verification. `KEYCLOAK_URL` alone is not read by `@cerebro/auth`.

Do not point `NEXT_PUBLIC_API_URL` at `:8900` unless the Rust gateway is actually running.
