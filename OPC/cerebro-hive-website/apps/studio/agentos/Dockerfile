FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8088

# Railway/Render inject $PORT at runtime; default to 8088 for local
# `docker run` / docker-compose. Shell form (not exec form) so ${PORT} is
# actually expanded.
# --no-server-header: uvicorn adds its own "Server: uvicorn" header at the
# protocol layer, before the app's response even reaches SecurityHeadersMiddleware
# (app/middleware.py) — that middleware can't strip it, only this flag can.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8088} --no-server-header
