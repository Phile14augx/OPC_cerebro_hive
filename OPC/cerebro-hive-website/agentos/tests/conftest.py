import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ["DATABASE_URL"] = os.environ.get("DATABASE_URL", "sqlite:///test_agentos.db")
os.environ["ANTHROPIC_API_KEY"] = ""
os.environ["OPENAI_API_KEY"] = ""
os.environ["GOOGLE_API_KEY"] = ""

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db import Base, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.rate_limit import limiter  # noqa: E402


@pytest.fixture(autouse=True)
def _reset_db():
    # Full schema reset before every test — without this, tests share one
    # on-disk SQLite file for the whole run and leak state (agents, policies,
    # approvals) across test functions, which makes assertions like "exactly
    # one pending approval for this run" order-dependent and flaky.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture(autouse=True)
def _reset_rate_limits():
    # Same reasoning as _reset_db: slowapi's in-memory limiter is process-wide
    # state, so without a reset every test shares one bucket and legitimate
    # test traffic eventually trips the same 429s a real abusive caller
    # would. Rate-limiting behavior itself is covered by its own dedicated
    # test (test_production_gates.py), which doesn't rely on this reset.
    limiter.reset()
    yield


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
