# Deploying AgentOS

This document describes the production deployment currently used by the repository. Alternative hosting providers are possible and documented below, but they are not maintained as the primary deployment path — if you're deploying this repo's `main` branch normally, you're using the production path, not the alternatives.

## Production deployment (authoritative)

AgentOS ships as part of the repository's single VPS deployment, alongside the CerebroHive marketing website and `apps/studio/platform`. This is fully automated:

- **Trigger**: `.github/workflows/ssh-deploy.yml` — runs on every push to `main` (and via manual `workflow_dispatch`). No separate step is needed to deploy AgentOS; it happens as part of the same run that deploys everything else.
- **Mechanism**: `scripts/deploy/vps-deploy.sh`, executed over SSH on a Hostinger VPS. The script is idempotent — safe to re-run, safe to re-trigger.
- **Stack**: `docker compose` brings up a shared Postgres (`pgvector/pgvector:pg16`) container, Redis, and NATS, plus this service's own container (built from this directory's `Dockerfile`). The Next.js website runs separately under PM2 on the same host.
- **Reverse proxy**: Nginx terminates TLS (via Certbot/Let's Encrypt) and proxies `https://<domain>/agentos/` to this container on `127.0.0.1:8088`, stripping the `/agentos/` prefix before forwarding.
- **Database**: a dedicated Postgres role and database (`agentos`) are created inside the shared Postgres container — not a separate managed database. Durable via a named Docker volume (`postgres_data`), so it survives container recreation, not just process restarts.
- **Secrets**: `AGENTOS_ADMIN_SECRET` is generated once (`openssl rand -hex 32`) and persisted to a secrets file on the VPS; `AGENTOS_ALLOWED_ORIGINS` is computed from the deployment's own domain, not hardcoded.
- **AI provider**: `ANTHROPIC_API_KEY` is passed through if present on the host; if absent, the service falls back to the offline mock LLM provider automatically (no configuration needed either way).

None of the steps below (env vars, admin secret, allowed origins) need to be performed manually for the production path — `vps-deploy.sh` does all of it. This section exists so anyone reading the deploy script can cross-reference what it's doing and why, not as a separate manual procedure.

## Alternative deployment options (not the production path)

If you want to run AgentOS as a fully standalone service — outside this repository's own CI/CD, paired with a website hosted elsewhere (e.g. Vercel) — the app supports that too. This is a genuine, working option, just not what actually runs today.

Before deploying this way, anywhere, generate an admin secret — this is what gates `POST /auth/api-keys` so random visitors can't mint themselves a bearer token once this is public:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Required environment variables (all three platforms below)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Provided automatically if you add a managed Postgres add-on (a `postgres://...` URL is fine, it's auto-normalized) |
| `AGENTOS_ADMIN_SECRET` | The secret you generated above |
| `AGENTOS_ALLOWED_ORIGINS` | Your live website's origin(s), e.g. `https://your-domain.example,https://www.your-domain.example` |
| `ANTHROPIC_API_KEY` | Optional — omit to keep using the offline mock LLM provider |

### Railway

1. New Project → Deploy from GitHub repo → select this repo.
2. In the service's Settings, set **Root Directory** to `agentos`.
3. Add a Postgres plugin to the project (Railway wires `DATABASE_URL` into the service automatically).
4. Add `AGENTOS_ADMIN_SECRET` and `AGENTOS_ALLOWED_ORIGINS` under Variables.
5. Railway detects the `Dockerfile` and builds/deploys automatically. It injects `$PORT` — the Dockerfile's `CMD` already reads it.
6. Copy the generated `*.up.railway.app` URL — that's your `NEXT_PUBLIC_AGENTOS_API_URL`.

### Render

1. New → Web Service → connect this repo.
2. **Root Directory**: `agentos`. **Runtime**: Docker (Render will find the `Dockerfile`).
3. New → PostgreSQL (separate resource) → copy its **Internal Database URL** into the web service's `DATABASE_URL` env var.
4. Add `AGENTOS_ADMIN_SECRET` and `AGENTOS_ALLOWED_ORIGINS`.
5. Render also injects `$PORT`; no changes needed.

### Fly.io

```bash
cd agentos
fly launch --no-deploy   # generates fly.toml, pick a Postgres cluster when prompted
fly secrets set AGENTOS_ADMIN_SECRET=<value> AGENTOS_ALLOWED_ORIGINS=https://your-domain.example
fly deploy
```

`fly launch` detects the `Dockerfile` and offers to attach a Postgres cluster, wiring `DATABASE_URL` for you.

### After deploying standalone

1. Set the website's `NEXT_PUBLIC_AGENTOS_API_URL` env var (in Vercel's project settings, or wherever the website is hosted) to your deployed backend's URL.
2. Redeploy the website.
3. On `/products/agentos/live-runtime` → "Full Backend" tab, you'll be prompted for the admin secret before it connects — enter the same value you set as `AGENTOS_ADMIN_SECRET`.

## What's still an MVP, not hardened production infra

Per the main `README.md`'s roadmap section: SQLite→Postgres and the auth/CORS gates above are the two items this pass actually closes (both are true of the production VPS path already, since it uses a real Postgres role and both env vars). Still open, in priority order if this gets significant traffic: rate limiting on `/auth/api-keys` and `/runtime/execute`, structured logging/alerting, and the communication bus / workflow engine swaps (NATS / Temporal) called out in the README. Separately, the production deploy script's own health check for this service is currently informational only (logs the HTTP status, doesn't fail the deploy if the container never comes up) — see `audit/AGENTOS-DEPLOYMENT-CONSISTENCY-AUDIT.md` for the full audit trail behind this document.
