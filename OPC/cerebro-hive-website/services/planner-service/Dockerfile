# ── Build stage ────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build
RUN pip install --no-cache-dir hatchling

COPY pyproject.toml ./
COPY src/ ./src/

RUN pip install --no-cache-dir --prefix=/install .

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

LABEL org.opencontainers.image.title="hiveswarm-planner-service"
LABEL org.opencontainers.image.description="HiveSwarm goal decomposition service"

# Non-root user
RUN addgroup --system planner && adduser --system --ingroup planner planner

WORKDIR /app
COPY --from=builder /install /usr/local
COPY src/ ./src/

USER planner

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8920

CMD ["uvicorn", "planner.main:app", "--host", "0.0.0.0", "--port", "8920"]
