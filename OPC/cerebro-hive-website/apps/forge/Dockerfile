# ──────────────────────────────────────────────────────────────────────────────
# HiveForge — Next.js Workflow Builder
# Multi-stage, multi-arch (linux/amd64 + linux/arm64)
# ──────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20
ARG ALPINE_VERSION=3.19

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
RUN corepack enable && corepack prepare pnpm@9 --activate
ENV PNPM_HOME=/pnpm PATH="$PNPM_HOME:$PATH"
WORKDIR /app

# ── Deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/forge/package.json              ./apps/forge/
COPY apps/studio/package.json             ./apps/studio/
COPY packages/ai/package.json             ./packages/ai/
COPY packages/ai-gateway/package.json     ./packages/ai-gateway/
COPY packages/auth/package.json           ./packages/auth/
COPY packages/config/package.json         ./packages/config/
COPY packages/core-bus/package.json       ./packages/core-bus/
COPY packages/database/package.json       ./packages/database/
COPY packages/domain/package.json         ./packages/domain/
COPY packages/events/package.json         ./packages/events/
COPY packages/telemetry/package.json      ./packages/telemetry/
COPY packages/ui/package.json             ./packages/ui/
COPY packages/workflow/package.json       ./packages/workflow/
COPY services/forge-api/package.json      ./services/forge-api/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Builder ───────────────────────────────────────────────────────────────────
FROM deps AS builder
ARG BUILD_DATE GIT_SHA GIT_REF
COPY . .
RUN pnpm --filter @cerebro/database exec prisma generate
ENV NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
RUN pnpm --filter @cerebro/forge run build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runner
RUN apk add --no-cache curl dumb-init \
    && addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 nextjs

WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3001 HOSTNAME=0.0.0.0

COPY --from=builder --chown=nextjs:nodejs /app/apps/forge/.next/standalone    ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/forge/.next/static        ./apps/forge/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/forge/public              ./apps/forge/public

USER nextjs
EXPOSE 3001

ARG BUILD_DATE GIT_SHA GIT_REF
LABEL org.opencontainers.image.title="HiveForge" \
      org.opencontainers.image.vendor="CerebroHive" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      com.cerebrohive.service="forge"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/forge/server.js"]
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1
