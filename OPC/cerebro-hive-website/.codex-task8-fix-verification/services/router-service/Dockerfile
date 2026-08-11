# ── Build stage ────────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /build

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o router-service .

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12 AS runtime

LABEL org.opencontainers.image.title="hiveswarm-router-service"
LABEL org.opencontainers.image.description="HiveSwarm agent routing service"

COPY --from=builder /build/router-service /router-service

EXPOSE 8921

ENTRYPOINT ["/router-service"]
