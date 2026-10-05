import os
import sys
import time
import uuid

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Must happen BEFORE importing app/db: isolate the database and guarantee
# no API key so model calls never leave the machine.
_TEST_DB = os.path.join(os.path.dirname(__file__), f"_test_{uuid.uuid4().hex}.db")
os.environ["DATABASE_PATH"] = _TEST_DB
os.environ.pop("OPENROUTER_API_KEY", None)

import db                      # noqa: E402
import providers               # noqa: E402
import abuse                   # noqa: E402
from app import app as flask_app  # noqa: E402

# app.py's load_dotenv() may re-inject a real key from .env — strip it again
# so the suite never makes live model calls or spends rate limits.
os.environ.pop("OPENROUTER_API_KEY", None)

# Avoid live network in tests: pin the model cache and disable Ollama probing.
providers._model_cache["models"] = list(providers.FALLBACK_FREE_MODELS)
providers._model_cache["fetched_at"] = time.time() + 10**9
providers._detect_ollama = lambda: []


@pytest.fixture(scope="session", autouse=True)
def _cleanup_db():
    yield
    for suffix in ("", "-wal", "-shm"):
        try:
            os.remove(_TEST_DB + suffix)
        except FileNotFoundError:
            pass


@pytest.fixture()
def client():
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as c:
        yield c


@pytest.fixture()
def owner():
    """Fresh anonymous identity per test — mirrors a new browser."""
    return f"owner-{uuid.uuid4().hex[:12]}"


def headers(owner_token):
    return {"X-Owner-Token": owner_token, "Content-Type": "application/json"}


BLOCKS = {
    "role": "Career coach",
    "context": "Job posting:\n{{job_posting}}",
    "task": "Write a 3-sentence cover letter opener tailored to the posting.",
    "format": "Plain text, max 80 words.",
    "examples": "",
}
FREE_MODEL = "openai/gpt-oss-120b:free"


@pytest.fixture()
def saved_prompt(client, owner):
    """A saved prompt with one version; returns (prompt_id, version_id, owner)."""
    res = client.post("/api/prompts", headers=headers(owner),
                      json={"title": "Cover letter", "blocks": BLOCKS, "model": FREE_MODEL})
    assert res.status_code == 201, res.get_json()
    pid = res.get_json()["id"]
    detail = client.get(f"/api/prompts/{pid}", headers=headers(owner)).get_json()
    vid = detail["versions"][0]["id"]
    return pid, vid, owner
