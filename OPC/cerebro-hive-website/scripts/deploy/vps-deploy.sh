#!/usr/bin/env bash
# ==============================================================================
# CerebroHive — full-stack VPS deploy for https://cerebropchive.org/
# Target: Hostinger KVM VPS, Ubuntu 24.04, run as root.
#
# One command, idempotent, safe to re-run:
#   bash /opt/cerebro/OPC/cerebro-hive-website/scripts/deploy/vps-deploy.sh
#
# What it does (every run):
#   1. Pull latest main into /opt/cerebro
#   2. Ensure swap, base packages, Node 20, Docker
#   3. Generate (once) and reuse production secrets  -> /root/cerebro-secrets.env
#   4. docker compose up: PostgreSQL(pgvector) + Redis + AgentOS backend
#   5. Write .env.production, npm ci, prisma migrate deploy, next build (standalone)
#   6. Run site under PM2, configure Nginx for cerebropchive.org (+/agentos proxy)
#   7. Issue/renew Let's Encrypt cert, then health-check everything
# ==============================================================================
set -euo pipefail

DOMAIN="cerebropchive.org"
EMAIL="philemonvnath@gmail.com"
REPO_DIR="/opt/cerebro"
APP_DIR="${REPO_DIR}/OPC/cerebro-hive-website"
STACK_DIR="/opt/cerebro-stack"
SECRETS_FILE="/root/cerebro-secrets.env"
LOG_FILE="/var/log/cerebro-deploy.log"

exec > >(tee -a "${LOG_FILE}") 2>&1
echo ""
echo "=============================================================="
echo "== CerebroHive deploy started: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "=============================================================="

step() { echo ""; echo ">>> [$(date '+%H:%M:%S')] $*"; }

# ------------------------------------------------------------------ 1. git pull
step "Updating repository"
if [ -d "${REPO_DIR}/.git" ]; then
  git -C "${REPO_DIR}" fetch origin main
  git -C "${REPO_DIR}" reset --hard origin/main
else
  echo "ERROR: ${REPO_DIR} is not a git clone. Clone the repo there first."
  exit 1
fi
git -C "${REPO_DIR}" log --oneline -1

# The pull above may have replaced THIS very script. Re-exec a private copy of
# the fresh version exactly once, so the rest of the run always uses current
# logic (bash reading a file that mutates mid-run executes stale/mixed bytes).
if [ "${CEREBRO_DEPLOY_REEXEC:-0}" != "1" ]; then
  cp "${APP_DIR}/scripts/deploy/vps-deploy.sh" /tmp/vps-deploy.fresh.sh
  CEREBRO_DEPLOY_REEXEC=1 exec bash /tmp/vps-deploy.fresh.sh
fi

# ------------------------------------------------------------- 2. system basics
step "Ensuring swap (build safety on 4GB RAM)"
if ! swapon --show --noheadings | grep -q .; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "4G swap enabled"
else
  echo "swap already present"
fi

step "Installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y -qq
apt-get install -y -qq ca-certificates curl gnupg git nginx ufw openssl rsync >/dev/null

step "Ensuring Node.js 20"
if ! command -v node >/dev/null || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
node -v && npm -v

step "Ensuring Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh >/dev/null
fi
systemctl enable --now docker >/dev/null 2>&1 || true
docker --version

step "Ensuring PM2"
command -v pm2 >/dev/null || npm install -g pm2 >/dev/null
pm2 -v

# ---------------------------------------------------------------- 3. secrets
step "Loading/generating production secrets"
if [ ! -f "${SECRETS_FILE}" ]; then
  cat > "${SECRETS_FILE}" <<EOF
PG_SUPER_PASS=$(openssl rand -hex 24)
PG_AGENTOS_PASS=$(openssl rand -hex 24)
REDIS_PASS=$(openssl rand -hex 24)
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
AGENTOS_ADMIN_SECRET=$(openssl rand -hex 32)
EOF
  chmod 600 "${SECRETS_FILE}"
  echo "New secrets generated at ${SECRETS_FILE}"
else
  echo "Reusing existing secrets from ${SECRETS_FILE}"
fi
# shellcheck disable=SC1090
source "${SECRETS_FILE}"

# ------------------------------------------------- 4. docker stack (db/redis/agentos)
step "Writing docker compose stack"
mkdir -p "${STACK_DIR}"

cat > "${STACK_DIR}/init-agentos-db.sh" <<'EOSQL'
#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
    DO \$\$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'agentos') THEN
        CREATE ROLE agentos LOGIN PASSWORD '${PG_AGENTOS_PASS}';
      END IF;
    END \$\$;
    SELECT 'CREATE DATABASE agentos OWNER agentos'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'agentos')\gexec
SQL
EOSQL
chmod +x "${STACK_DIR}/init-agentos-db.sh"

cat > "${STACK_DIR}/docker-compose.yml" <<EOF
services:
  db:
    image: pgvector/pgvector:pg16
    container_name: cerebrohive-db
    restart: always
    environment:
      POSTGRES_USER: cerebrohive
      POSTGRES_PASSWORD: ${PG_SUPER_PASS}
      POSTGRES_DB: cerebrohive_db
      PG_AGENTOS_PASS: ${PG_AGENTOS_PASS}
    ports:
      - "127.0.0.1:5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ${STACK_DIR}/init-agentos-db.sh:/docker-entrypoint-initdb.d/10-agentos.sh:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cerebrohive"]
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: cerebrohive-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASS}
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data

  agentos:
    build: ${APP_DIR}/agentos
    container_name: cerebrohive-agentos
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql+psycopg2://agentos:${PG_AGENTOS_PASS}@db:5432/agentos
      AGENTOS_ADMIN_SECRET: ${AGENTOS_ADMIN_SECRET}
      AGENTOS_ALLOWED_ORIGINS: https://${DOMAIN},https://www.${DOMAIN}
      ANTHROPIC_API_KEY: \${ANTHROPIC_API_KEY:-}
    ports:
      - "127.0.0.1:8088:8088"

volumes:
  postgres_data:
  redis_data:
EOF

step "Starting docker stack (db, redis, agentos)"
docker compose -f "${STACK_DIR}/docker-compose.yml" up -d --build
echo "Waiting for PostgreSQL to be healthy..."
for i in $(seq 1 30); do
  if docker exec cerebrohive-db pg_isready -U cerebrohive >/dev/null 2>&1; then break; fi
  sleep 2
done
docker exec cerebrohive-db pg_isready -U cerebrohive

# Ensure agentos role/db exist even if the volume predates the init script
docker exec cerebrohive-db psql -U cerebrohive -d cerebrohive_db -tc \
  "SELECT 1 FROM pg_roles WHERE rolname='agentos'" | grep -q 1 || \
  docker exec cerebrohive-db psql -U cerebrohive -d cerebrohive_db -c \
  "CREATE ROLE agentos LOGIN PASSWORD '${PG_AGENTOS_PASS}';"
docker exec cerebrohive-db psql -U cerebrohive -d cerebrohive_db -tc \
  "SELECT 1 FROM pg_database WHERE datname='agentos'" | grep -q 1 || \
  docker exec cerebrohive-db psql -U cerebrohive -d cerebrohive_db -c \
  "CREATE DATABASE agentos OWNER agentos;"

# ------------------------------------------------------------- 5. app build
step "Writing production .env"
ENV_FILE="${APP_DIR}/.env.production"
cat > "${ENV_FILE}" <<EOF
DATABASE_URL="postgresql://cerebrohive:${PG_SUPER_PASS}@127.0.0.1:5433/cerebrohive_db?schema=public"
REDIS_URL="redis://:${REDIS_PASS}@127.0.0.1:6379"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="https://${DOMAIN}"
NEXT_PUBLIC_AGENTOS_API_URL="https://${DOMAIN}/agentos"
ALLOWED_ORIGINS="https://${DOMAIN},https://www.${DOMAIN}"
NODE_ENV="production"
EOF
chmod 600 "${ENV_FILE}"

step "Installing npm dependencies (this can take a few minutes)"
cd "${APP_DIR}"
npm ci --no-audit --no-fund

step "Prisma: generate client + apply migrations"
set -a; source "${ENV_FILE}"; set +a
npx prisma generate
npx prisma migrate deploy

step "Building Next.js app (standalone)"
rm -rf .next
npm run build

step "Assembling standalone bundle"
SERVER_JS="$(find .next/standalone -maxdepth 4 -name server.js | head -1)"
if [ -z "${SERVER_JS}" ]; then echo "ERROR: server.js not found in standalone output"; exit 1; fi
STANDALONE_APP_DIR="$(dirname "${SERVER_JS}")"
echo "standalone server: ${SERVER_JS}"
rsync -a --delete public/ "${STANDALONE_APP_DIR}/public/"
mkdir -p "${STANDALONE_APP_DIR}/.next"
rsync -a --delete .next/static/ "${STANDALONE_APP_DIR}/.next/static/"

# Durable JSON store: keep data/db.json (contacts, leads, tickets, enrollments)
# in /var/lib/cerebro-data so redeploys don't wipe submissions. Seed it from the
# repo's data/ on first run, then symlink the standalone app's data dir to it.
mkdir -p /var/lib/cerebro-data
if [ ! -f /var/lib/cerebro-data/db.json ] && [ -d "${APP_DIR}/data" ]; then
  cp -a "${APP_DIR}/data/." /var/lib/cerebro-data/ 2>/dev/null || true
fi
rm -rf "${STANDALONE_APP_DIR}/data"
ln -sfn /var/lib/cerebro-data "${STANDALONE_APP_DIR}/data"

# --------------------------------------------------------------- 6. run + nginx
step "Starting app with PM2"
export HOSTNAME=127.0.0.1 PORT=3000
if pm2 describe cerebro-hive >/dev/null 2>&1; then
  pm2 delete cerebro-hive >/dev/null
fi
pm2 start "${SERVER_JS}" --name cerebro-hive --time
pm2 save >/dev/null
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
pm2 save >/dev/null 2>&1 || true

step "Configuring Nginx"
cat > /etc/nginx/sites-available/cerebro-hive <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 25m;

    # AgentOS FastAPI backend (path prefix stripped)
    location /agentos/ {
        proxy_pass http://127.0.0.1:8088/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }
    location = /agentos {
        return 302 /agentos/;
    }

    # Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/cerebro-hive /etc/nginx/sites-enabled/cerebro-hive
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx >/dev/null 2>&1 || true
systemctl reload nginx

step "Firewall"
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 80/tcp  >/dev/null 2>&1 || true
ufw allow 443/tcp >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true
ufw status | head -10 || true

step "HTTPS certificate (Let's Encrypt)"
command -v certbot >/dev/null || apt-get install -y -qq certbot python3-certbot-nginx >/dev/null
# Works for both first issuance and re-installing an existing cert into the
# freshly written nginx config (certbot reuses the cert if not due for renewal).
certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" \
  --non-interactive --agree-tos -m "${EMAIL}" --redirect
systemctl reload nginx

# --------------------------------------------------------------- 7. health checks
step "Health checks"
sleep 3
echo "--- pm2 ---";     pm2 ls
echo "--- docker ---";  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
echo "--- next (127.0.0.1:3000) ---"
curl -s -o /dev/null -w "HTTP %{http_code} in %{time_total}s\n" http://127.0.0.1:3000/ || true
echo "--- agentos (127.0.0.1:8088) ---"
curl -s -o /dev/null -w "HTTP %{http_code} in %{time_total}s\n" http://127.0.0.1:8088/ || true
echo "--- https://${DOMAIN}/ ---"
curl -s -o /dev/null -w "HTTP %{http_code} in %{time_total}s\n" "https://${DOMAIN}/" || true

echo ""
echo "=============================================================="
echo "== Deploy finished: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "== Site:    https://${DOMAIN}/"
echo "== Secrets: ${SECRETS_FILE} (keep safe)"
echo "== Logs:    pm2 logs cerebro-hive | docker logs cerebrohive-agentos"
echo "=============================================================="
