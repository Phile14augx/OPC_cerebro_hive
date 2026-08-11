FROM python:3.11-slim AS builder
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir hatchling --break-system-packages \
 && pip install --no-cache-dir fastapi uvicorn[standard] httpx anthropic \
        pydantic pydantic-settings structlog --break-system-packages

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=builder /usr/local/bin /usr/local/bin
COPY src/ ./src/
COPY pyproject.toml .

ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1

EXPOSE 8960

CMD ["python", "-m", "agent_runner.main"]
