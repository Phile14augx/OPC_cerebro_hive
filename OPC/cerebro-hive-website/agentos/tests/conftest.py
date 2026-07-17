import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/test_agentos.db")
os.environ.setdefault("ANTHROPIC_API_KEY", "")  # force the mock LLM provider in tests

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def auth_headers(client: TestClient) -> dict:
    resp = client.post("/auth/api-keys", json={"owner": "test-suite"})
    assert resp.status_code == 200
    token = resp.json()["api_key"]
    return {"Authorization": f"Bearer {token}"}
