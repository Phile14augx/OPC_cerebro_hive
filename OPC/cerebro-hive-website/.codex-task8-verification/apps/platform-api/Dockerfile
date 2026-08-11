# ──────────────────────────────────────────────────────────────────────────────
# Platform API — Node.js / Express / Fastify REST + gRPC
# Multi-stage, multi-arch (linux/amd64 + linux/arm64)
# ──────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20
ARG ALPINE_VERSION=3.19

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeapi
RUN corepack enable && corepack prepare pnpm@9 --activate
ENV PNPM_HOME=/pnpm PATH="$PNPM_HOME:$PATH"
WORKDIR /app

# ── Deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/platform-api/package.json       ./apps/platform-api/
COPY packages/ai/package.json             ./packages/ai/
COPY packages/ai-gateway/package.json     ./packages/ai-gateway/
COPY packages/auth/package.json           ./packages/auth/
COPY packages/config/package.json         ./packages/config/
COPY packages/core-bus/package.json       ./packages/core-bus/
COPY packages/database/package.json       ./packages/database/
COPY packages/domain/package.json         ./packages/domain/
COPY packages/events/package.json         ./packages/events/
COPY packages/telemetry/package.json      ./packages/telemetry/
COPY packages/workflow/package.json       ./packages/workflow/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Builder ───────────────────────────────────────────────────────────────────
FROM deps AS builder
ARG BUILD_DATE GIT_SHA GIT_REF
COPY . .
RUN pnpm --filter @cerebro/database exec prisma generate
ENV NODE_ENV=production
RUN pnpm --filter @cerebro/platform-api run build

# Prune dev dependencies for leaner runtime
RUN pnpm --filter @cerebro/platform-api deploy --prod /build/platform-api

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runner
RUN apk add --no-cache curl dumb-init \
    && addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 nodeapi

WORKDIR /app
ENV NODE_ENV=production PORT=4000 HOSTNAME=0.0.0.0

# Copy pruned node_modules + compiled dist
COPY --from=builder --chown=nodeapi:nodejs /build/platform-api/node_modules  ./node_modules
COPY --from=builder --chown=nodeapi:nodejs /app/apps/platform-api/dist        ./dist
COPY --from=builder --chown=nodeapi:nodejs /app/node_modules/.prisma          ./.prisma

USER nodeapi
EXPOSE 4000

ARG BUILD_DATE GIT_SHA GIT_REF
LABEL org.opencontainers.image.title="CerebroHive Platform API" \
      org.opencontainers.image.vendor="CerebroHive" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      com.cerebrohive.service="platform-api"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.js"]
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1
