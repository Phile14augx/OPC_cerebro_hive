# ── Build stage ────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build
RUN pip install --no-cache-dir hatchling

COPY pyproject.toml ./
COPY src/ ./src/

RUN pip install --no-cache-dir --prefix=/install .

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

LABEL org.opencontainers.image.title="hiveswarm-evaluation-service"
LABEL org.opencontainers.image.description="HiveSwarm task output quality evaluator"

RUN addgroup --system evaluator && adduser --system --ingroup evaluator evaluator

WORKDIR /app
COPY --from=builder /install /usr/local
COPY src/ ./src/

USER evaluator

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8922

CMD ["uvicorn", "evaluator.main:app", "--host", "0.0.0.0", "--port", "8922"]
