# ── Build stage ──────────────────────────────────────────────────────────────
FROM rust:1.80-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Cache dependencies
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main(){}" > src/main.rs
RUN cargo build --release 2>/dev/null || true
RUN rm src/main.rs

# Build real binary
COPY src ./src
RUN cargo build --release

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM debian:bookworm-slim AS runtime
RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*
RUN groupadd -r cerebro && useradd -r -g cerebro cerebro
COPY --from=builder /app/target/release/gateway /usr/local/bin/gateway
USER cerebro
EXPOSE 8080 9090
HEALTHCHECK --interval=15s --timeout=5s CMD wget -qO- http://localhost:8080/health || exit 1
ENTRYPOINT ["/usr/local/bin/gateway"]
