# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM golang:1.23-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o /bin/swarm-runtime ./main.go

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12

COPY --from=builder /bin/swarm-runtime /swarm-runtime
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

USER nonroot:nonroot

ENTRYPOINT ["/swarm-runtime"]
