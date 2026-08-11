# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace config
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/ai/package.json ./packages/ai/
COPY packages/workflow/package.json ./packages/workflow/
COPY packages/database/package.json ./packages/database/
COPY services/forge-api/package.json ./services/forge-api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/ai ./packages/ai
COPY packages/workflow ./packages/workflow
COPY packages/database ./packages/database
COPY services/forge-api ./services/forge-api

# Generate Prisma client
RUN pnpm --filter @cerebro/database run generate

# Build forge-api
RUN pnpm --filter @cerebro/forge-api run build

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/services/forge-api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/database/node_modules/.prisma ./.prisma

USER nestjs

EXPOSE 4005
ENV NODE_ENV=production

CMD ["node", "dist/main"]
