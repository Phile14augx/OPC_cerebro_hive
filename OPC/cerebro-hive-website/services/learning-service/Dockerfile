# ── Build stage ────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build
RUN pip install --no-cache-dir hatchling

COPY pyproject.toml ./
COPY src/ ./src/

RUN pip install --no-cache-dir --prefix=/install .

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

LABEL org.opencontainers.image.title="hiveswarm-learning-service"
LABEL org.opencontainers.image.description="HiveSwarm replay, benchmarking, and prompt optimisation service"

RUN addgroup --system learner && adduser --system --ingroup learner learner

WORKDIR /app
COPY --from=builder /install /usr/local
COPY src/ ./src/

USER learner

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8950

CMD ["uvicorn", "learner.main:app", "--host", "0.0.0.0", "--port", "8950"]
