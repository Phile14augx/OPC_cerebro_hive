# ── Build stage ────────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /build

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o memory-service .

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12 AS runtime

LABEL org.opencontainers.image.title="hiveswarm-memory-service"
LABEL org.opencontainers.image.description="HiveSwarm multi-tier agent memory service"

COPY --from=builder /build/memory-service /memory-service

EXPOSE 8930

ENTRYPOINT ["/memory-service"]
