# ── Build stage ────────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /build

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o tool-gateway .

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12 AS runtime

LABEL org.opencontainers.image.title="hiveswarm-tool-gateway"
LABEL org.opencontainers.image.description="HiveSwarm tool registry and execution proxy"

COPY --from=builder /build/tool-gateway /tool-gateway

EXPOSE 8940

ENTRYPOINT ["/tool-gateway"]
