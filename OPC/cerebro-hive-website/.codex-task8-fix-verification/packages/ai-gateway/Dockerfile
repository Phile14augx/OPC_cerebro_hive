# ──────────────────────────────────────────────────────────────────────────────
# AI Gateway — Multi-provider LLM router
# Handles: request routing, rate limiting, cost tracking, failover,
#          token counting, caching, streaming, observability
# ──────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20
ARG ALPINE_VERSION=3.19

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 gateway
RUN corepack enable && corepack prepare pnpm@9 --activate
ENV PNPM_HOME=/pnpm PATH="$PNPM_HOME:$PATH"
WORKDIR /app

# ── Deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/ai-gateway/package.json     ./packages/ai-gateway/
COPY packages/ai/package.json             ./packages/ai/
COPY packages/auth/package.json           ./packages/auth/
COPY packages/config/package.json         ./packages/config/
COPY packages/core-bus/package.json       ./packages/core-bus/
COPY packages/events/package.json         ./packages/events/
COPY packages/telemetry/package.json      ./packages/telemetry/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Builder ───────────────────────────────────────────────────────────────────
FROM deps AS builder
ARG BUILD_DATE GIT_SHA GIT_REF
COPY . .
ENV NODE_ENV=production
RUN pnpm --filter @cerebro/ai-gateway run build

RUN pnpm --filter @cerebro/ai-gateway deploy --prod /build/ai-gateway

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runner
RUN apk add --no-cache curl dumb-init \
    && addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 gateway

WORKDIR /app
ENV NODE_ENV=production PORT=4010 HOSTNAME=0.0.0.0

COPY --from=builder --chown=gateway:nodejs /build/ai-gateway/node_modules   ./node_modules
COPY --from=builder --chown=gateway:nodejs /app/packages/ai-gateway/dist    ./dist

USER gateway
EXPOSE 4010

# AI Gateway needs higher limits for streaming LLM responses
ENV UV_THREADPOOL_SIZE=16
ENV NODE_OPTIONS="--max-old-space-size=512"

ARG BUILD_DATE GIT_SHA GIT_REF
LABEL org.opencontainers.image.title="CerebroHive AI Gateway" \
      org.opencontainers.image.vendor="CerebroHive" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      com.cerebrohive.service="ai-gateway"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:4010/health || exit 1
