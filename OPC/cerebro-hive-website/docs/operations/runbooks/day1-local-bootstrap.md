# Runbook — Day 1 local bootstrap

1. Copy `.env.example` to `.env`.
2. Set `KEYCLOAK_SERVER_URL` to the same host as Keycloak.
3. For Studio against platform-api (no Rust gateway): `NEXT_PUBLIC_API_URL=http://localhost:3406`.
4. Start compose: `docker compose --profile core up -d`.
5. Confirm Postgres port (`5432` in the template; `5433` on some developer machines).
6. `pnpm install && pnpm prisma:generate`.
7. Apply migrations against that database.
8. Start forge-api `:4005`, platform-api `:3406`, Studio `:3401`.
9. Open `/app`. Login must land on `/app`, not `/dashboard`.
10. Forge tools must call `:4005`. A 401/501/placeholder is acceptable; a fabricated success is not.

If Studio cannot reach platform-api, check that `NEXT_PUBLIC_API_URL` does not still point at a stopped `:8900` gateway.
