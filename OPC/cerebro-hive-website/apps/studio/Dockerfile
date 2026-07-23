# ──────────────────────────────────────────────────────────────────────────────
# CerebroStudio — Next.js 15 Standalone
# Multi-stage, multi-arch (linux/amd64 + linux/arm64)
#
# Stages:
#   base       — shared Node + pnpm setup
#   deps       — install all workspace dependencies
#   builder    — generate Prisma client, build Next.js standalone
#   runner     — minimal runtime image (~200MB)
# ──────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20
ARG ALPINE_VERSION=3.19

# ── Stage 1: Base ──────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

# Security: create non-root user early
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Enable pnpm via corepack (matches workspace version)
RUN corepack enable && corepack prepare pnpm@9 --activate

ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# ── Stage 2: Install dependencies ──────────────────────────────────────────────
FROM base AS deps

# Copy manifests only (improves layer caching)
COPY package.json pnpm-workspace.yaml ./

# App manifests
COPY apps/studio/package.json                 ./apps/studio/
COPY apps/forge/package.json                  ./apps/forge/
COPY apps/platform-api/package.json           ./apps/platform-api/

# Package manifests
COPY packages/ai/package.json                 ./packages/ai/
COPY packages/ai-gateway/package.json         ./packages/ai-gateway/
COPY packages/auth/package.json               ./packages/auth/
COPY packages/config/package.json             ./packages/config/
COPY packages/core-bus/package.json           ./packages/core-bus/
COPY packages/database/package.json           ./packages/database/
COPY packages/domain/package.json             ./packages/domain/
COPY packages/events/package.json             ./packages/events/
COPY packages/telemetry/package.json          ./packages/telemetry/
COPY packages/ui/package.json                 ./packages/ui/
COPY packages/workflow/package.json           ./packages/workflow/

# Service manifests
COPY services/forge-api/package.json          ./services/forge-api/

# Lock file + turbo config
COPY pnpm-lock.yaml turbo.json ./

# Install all workspace dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Stage 3: Build ────────────────────────────────────────────────────────────
FROM deps AS builder

ARG BUILD_DATE
ARG GIT_SHA
ARG GIT_REF
ARG SERVICE_NAME=studio

# Copy full source
COPY . .

# Generate Prisma client
RUN pnpm --filter @cerebro/database exec prisma generate

# Build Next.js in standalone mode
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV BUILD_DATE=${BUILD_DATE}
ENV GIT_SHA=${GIT_SHA}

RUN pnpm --filter @cerebro/studio run build

# Verify standalone output exists
RUN test -d apps/studio/.next/standalone || \
    (echo "ERROR: Standalone output not found. Ensure next.config has output:'standalone'" && exit 1)

# ── Stage 4: Runtime ──────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runner

# Security hardening
RUN apk add --no-cache \
    curl \
    dumb-init \
    && addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone bundle from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/studio/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/studio/.next/static      ./apps/studio/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/studio/public            ./apps/studio/public

USER nextjs

EXPOSE 3000

# Labels for OCI compliance
ARG BUILD_DATE
ARG GIT_SHA
ARG GIT_REF
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.ref.name="${GIT_REF}" \
      org.opencontainers.image.title="CerebroHive Studio" \
      org.opencontainers.image.description="CerebroStudio — AI Platform Frontend" \
      org.opencontainers.image.vendor="CerebroHive" \
      com.cerebrohive.service="studio"

# Use dumb-init as PID 1 to handle signals correctly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/studio/server.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1
