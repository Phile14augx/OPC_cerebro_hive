# AgentOS Deployment Consistency Audit

## Question this answers

`apps/studio/agentos/DEPLOY.md` describes deploying AgentOS as a **standalone** service (Railway, Render, or Fly.io) paired with a **Vercel-hosted** website. `scripts/deploy/vps-deploy.sh` does something structurally different: it builds AgentOS into the same docker-compose stack as everything else, on one Hostinger VPS, alongside the website and `apps/studio/platform`. Both can't be the live configuration at once — this audit determines which one actually is, and catalogs every point where they diverge, rather than assuming either is correct.

## Verdict

**`vps-deploy.sh` is authoritative. `DEPLOY.md` describes a superseded alternative, not the current deployment.** This isn't a guess — `vps-deploy.sh` is the one wired into live GitHub Actions automation (`ssh-deploy.yml`, triggered on every push to `main`); `DEPLOY.md`'s Railway/Render/Fly instructions aren't referenced by any CI workflow, and nothing else in the repo builds or deploys through them. `DEPLOY.md` reads like an earlier, standalone-service deployment plan that was written before the decision to consolidate everything onto one VPS.

That said, the two aren't in conflict on substance — they agree on almost every configuration fact (env var names, ports, auth gate). The divergence is entirely about *topology* (standalone multi-provider vs. one shared VPS), not about how the AgentOS app itself is configured. That's a reassuring result: it means the app code has one consistent contract; only the hosting instructions in `DEPLOY.md` are stale.

## Consistency matrix

| Topic | `DEPLOY.md` | `vps-deploy.sh` | Status |
|---|---|---|---|
| Hosting target | Standalone: Railway, Render, or Fly.io (pick one) | Docker container in a shared compose stack on one Hostinger VPS | **Divergence** — different topology entirely |
| Website hosting | Implies Vercel (`NEXT_PUBLIC_AGENTOS_API_URL` set "in Vercel's project settings") | Same VPS, PM2-managed Next.js standalone build | **Divergence** |
| Process manager | Platform-managed (Railway/Render/Fly each run the container directly) | `docker compose` for agentos, PM2 for the Next.js app | **Divergence** (expected, given hosting differs) |
| Reverse proxy | None described — each platform exposes AgentOS on its own public URL directly | Nginx, `location /agentos/` strips the prefix and proxies to `127.0.0.1:8088` | **Divergence** |
| `DATABASE_URL` | "Provided automatically if you add a managed Postgres add-on" | `postgresql+psycopg2://agentos:${PG_AGENTOS_PASS}@db:5432/agentos` — a dedicated role/database created inside the shared Postgres container, verified against `app/config.py`'s `database_url` field | **Match** on the variable name and semantics; differs only in where Postgres comes from (managed add-on vs. self-hosted container) |
| `AGENTOS_ADMIN_SECRET` | Generated via `python -c "import secrets..."`, required before deploy | Generated via `openssl rand -hex 32`, injected as the same env var name | **Match** — same gate, same purpose, confirmed against `config.py`'s `agentos_admin_secret` field |
| `AGENTOS_ALLOWED_ORIGINS` | Set to the live website's origin(s), e.g. `https://cerebrohive.com,https://www.cerebrohive.com` | Set to `https://${DOMAIN},https://www.${DOMAIN}` where `DOMAIN=cerebropchive.org` | **Match on mechanism, stale on value** — `DEPLOY.md`'s example uses the wrong domain for this deployment (`cerebrohive.com` instead of `cerebropchive.org`), but that's an example in prose, not something `vps-deploy.sh` copies from it — the script computes its own value correctly |
| `ANTHROPIC_API_KEY` | "Optional — omit to keep using the offline mock LLM provider" | Passed through as `\${ANTHROPIC_API_KEY:-}` (empty if unset on the host) | **Match** — both treat it as optional, mock-provider fallback confirmed in `README.md`'s "What's actually implemented" table |
| Port | Platform-injected `$PORT`, Dockerfile's `CMD` reads it (`uvicorn ... --port ${PORT:-8088}`) | No `PORT` env var set for the `agentos` service in the compose block — falls through to the Dockerfile's own default of `8088` | **Match** — same Dockerfile, same fallback behavior, just arrived at differently (platform-injected vs. default) |
| Persistent storage | Managed Postgres add-on (durability owned by the platform) | Same Postgres container as everything else, `postgres_data` named Docker volume | **Match on outcome** (both durable), different mechanism |
| Health checks | Not specified | `curl -s -o /dev/null -w "HTTP %{http_code}..." http://127.0.0.1:8088/` against the container's root path, logged but not gating (`|| true`) — informational only, doesn't fail the deploy if AgentOS isn't up | **Divergence / gap** — checked `app/main.py` directly: `GET /` is a real, defined route (returns a 200 JSON status payload), and `GET /health` also exists. So the check does hit something meaningful, it's just not wired to actually fail the deployment if the response isn't 200 — a real gap (silent partial-deploy risk), but not the false-negative risk raised as an open question earlier. |
| CORS / production gates | Documents `AGENTOS_ALLOWED_ORIGINS` and `AGENTOS_ADMIN_SECRET` as the two gates a Phase-1-MVP pass "actually closes" | Sets both | **Match** |

## What this means for `apps/studio/platform` "orphaned" correction

Nothing new here changes the `DEPLOYMENT-ARCHITECTURE-DISCOVERY.md` correction — this audit reinforces it. AgentOS, like `apps/studio/platform`, is real and deployed via the VPS path; `DEPLOY.md` was written for a deployment model that was apparently considered and then not the one actually adopted.

## Recommended action

Not "patch the docs" piecemeal — `DEPLOY.md` should be either:
1. Rewritten to describe the actual VPS/docker-compose/Nginx deployment (matching what `vps-deploy.sh` does), with the Railway/Render/Fly instructions removed or clearly marked as an alternative for anyone who wants to run AgentOS as a fully standalone service outside this repo's own automation, or
2. Left as-is but with a header note stating plainly that `scripts/deploy/vps-deploy.sh` is what actually runs in this repo's CI, and this file describes an alternative path that isn't currently used.

Given the two are substantively compatible (same env vars, same auth model, same optional-LLM-key behavior), option 1 is the lower-maintenance choice — there's no real conflict to reconcile, just a rewrite of the "how to host it" section.

One genuinely open item, not a documentation question: whether `app/main.py` actually serves anything at `/` (bears on whether the deploy script's health check is checking anything meaningful). Flagged above; not yet checked.
