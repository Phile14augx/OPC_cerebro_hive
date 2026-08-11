# ── Build stage ───────────────────────────────────────────────────────────────
FROM ubuntu:24.04 AS builder

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake ninja-build git \
    libssl-dev libpq-dev pkg-config curl ca-certificates \
    autoconf automake libtool \
    && rm -rf /var/lib/apt/lists/*

# gRPC + protobuf (installed from source to match version in CMakeLists.txt)
ARG GRPC_VERSION=v1.65.0
RUN git clone --depth 1 --branch ${GRPC_VERSION} \
        --recurse-submodules https://github.com/grpc/grpc /tmp/grpc \
    && cmake -S /tmp/grpc -B /tmp/grpc-build \
        -GNinja \
        -DCMAKE_BUILD_TYPE=Release \
        -DgRPC_INSTALL=ON \
        -DgRPC_BUILD_TESTS=OFF \
        -DCMAKE_INSTALL_PREFIX=/usr/local \
    && ninja -C /tmp/grpc-build install \
    && rm -rf /tmp/grpc /tmp/grpc-build

WORKDIR /build

# Copy source
COPY proto/ml.proto    /build/proto/
COPY proto/auth.proto  /build/proto/
COPY services/ml-svc/  /build/ml-svc/

# Build
RUN cmake -S /build/ml-svc -B /build/ml-svc/build \
        -GNinja \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_PREFIX_PATH=/usr/local \
    && ninja -C /build/ml-svc/build ml_svc

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM ubuntu:24.04 AS runtime

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl3 libpq5 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN useradd -r -s /sbin/nologin -u 1001 cerebro

COPY --from=builder /build/ml-svc/build/ml_svc /usr/local/bin/ml_svc

# Copy gRPC shared libs from builder
COPY --from=builder /usr/local/lib/libgrpc*.so*          /usr/local/lib/
COPY --from=builder /usr/local/lib/libprotobuf*.so*      /usr/local/lib/
COPY --from=builder /usr/local/lib/libabsl*.so*          /usr/local/lib/
RUN ldconfig

USER cerebro

EXPOSE 50051

ENV LOG_LEVEL=info \
    GRPC_ADDR=0.0.0.0:50051

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD [ "/usr/local/bin/grpc_health_probe", "-addr=:50051" ] || exit 1

ENTRYPOINT ["/usr/local/bin/ml_svc"]
