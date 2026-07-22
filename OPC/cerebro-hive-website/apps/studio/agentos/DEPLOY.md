# Deploying AgentOS to production

This service (`agentos/`) is a standalone FastAPI app, deployed separately from
the CerebroHive website. It builds from the `Dockerfile` in this folder, so
any of the three platforms below work the same way: point them at this
directory, add a Postgres database, set two env vars, deploy.

## Before you deploy, anywhere

Generate an admin secret — this is what gates `POST /auth/api-keys` so
random visitors can't mint themselves a bearer token once this is public:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

You'll set this as `AGENTOS_ADMIN_SECRET` below, and enter the same value in
the website's "Full Backend" tab when prompted.

## Required environment variables (all three platforms)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Provided automatically if you add a managed Postgres add-on (see per-platform notes — a `postgres://...` URL is fine, it's auto-normalized) |
| `AGENTOS_ADMIN_SECRET` | The secret you generated above |
| `AGENTOS_ALLOWED_ORIGINS` | Your live website's origin(s), e.g. `https://cerebrohive.com,https://www.cerebrohive.com` |
| `ANTHROPIC_API_KEY` | Optional — omit to keep using the offline mock LLM provider |

## Railway

1. New Project → Deploy from GitHub repo → select this repo.
2. In the service's Settings, set **Root Directory** to `agentos`.
3. Add a Postgres plugin to the project (Railway wires `DATABASE_URL` into
   the service automatically).
4. Add `AGENTOS_ADMIN_SECRET` and `AGENTOS_ALLOWED_ORIGINS` under Variables.
5. Railway detects the `Dockerfile` and builds/deploys automatically. It
   injects `$PORT` — the Dockerfile's `CMD` already reads it.
6. Copy the generated `*.up.railway.app` URL — that's your `NEXT_PUBLIC_AGENTOS_API_URL`.

## Render

1. New → Web Service → connect this repo.
2. **Root Directory**: `agentos`. **Runtime**: Docker (Render will find the `Dockerfile`).
3. New → PostgreSQL (separate resource) → copy its **Internal Database URL**
   into the web service's `DATABASE_URL` env var.
4. Add `AGENTOS_ADMIN_SECRET` and `AGENTOS_ALLOWED_ORIGINS`.
5. Render also injects `$PORT`; no changes needed.

## Fly.io

```bash
cd agentos
fly launch --no-deploy   # generates fly.toml, pick a Postgres cluster when prompted
fly secrets set AGENTOS_ADMIN_SECRET=<value> AGENTOS_ALLOWED_ORIGINS=https://cerebrohive.com
fly deploy
```

`fly launch` detects the `Dockerfile` and offers to attach a Postgres
cluster, wiring `DATABASE_URL` for you.

## After deploying

1. Set the website's `NEXT_PUBLIC_AGENTOS_API_URL` env var (in Vercel's
   project settings) to your deployed backend's URL.
2. Redeploy the website.
3. On `/products/agentos/live-runtime` → "Full Backend" tab, you'll be
   prompted for the admin secret before it connects — enter the same value
   you set as `AGENTOS_ADMIN_SECRET`.

## What's still an MVP, not hardened production infra

Per the main `README.md`'s roadmap section: SQLite→Postgres and the auth/CORS
gates above are the two items this pass actually closes. Still open, in
priority order if this gets real traffic: rate limiting on `/auth/api-keys`
and `/runtime/execute`, structured logging/alerting, and the communication
bus / workflow engine swaps (NATS / Temporal) called out in the README.
