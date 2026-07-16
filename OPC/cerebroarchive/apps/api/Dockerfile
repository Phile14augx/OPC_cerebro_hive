# Stage 1: Build Environment
FROM golang:1.24-alpine AS builder

# Install necessary build tools (git, ca-certificates for external calls)
RUN apk update && apk add --no-cache git ca-certificates tzdata && update-ca-certificates

# Create an unprivileged user for the runtime
ENV USER=cerebro
ENV UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

WORKDIR /app

# Dependency caching
COPY go.mod go.sum* ./
RUN go mod download
RUN go mod verify

# Copy application source
COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s -X main.version=$(git describe --tags --always --dirty || echo 'dev')" \
    -o /api-server ./cmd/api

# Stage 2: Minimal Runtime (scratch)
FROM scratch

# Import necessary files from builder
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Copy the binary
COPY --from=builder /api-server /api-server

# Use the unprivileged user
USER cerebro:cerebro

EXPOSE 3000

# Run the binary
ENTRYPOINT ["/api-server"]
