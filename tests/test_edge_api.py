"""API-level edge cases — sections A, B, C, D5-6, E, F5-7, G1-4, I of docs/EDGE_CASES.md."""

import json

import db
from app import app as flask_app
from conftest import BLOCKS, FREE_MODEL, headers


# ── A. Persistence ──────────────────────────────────────────────────

def _restart():
    """A server restart = new process over the same SQLite file: fresh
    connections + init_db() re-run. Connections are already per-request."""
    db.init_db()


def test_saved_prompt_survives_restart(client, saved_prompt):
    pid, _, owner = saved_prompt
    _restart()
    res = client.get(f"/api/prompts/{pid}", headers=headers(owner))
    assert res.status_code == 200
    assert res.get_json()["prompt"]["title"] == "Cover letter"


def test_runs_survive_restart(client, saved_prompt):
    pid, vid, owner = saved_prompt
    db.record_run(vid, FREE_MODEL, "output text")
    _restart()
    runs = client.get(f"/api/versions/{vid}/runs", headers=headers(owner)).get_json()["runs"]
    assert len(runs) == 1 and runs[0]["output"] == "output text"


def test_identical_version_dedupes(client, saved_prompt):
    pid, vid, owner = saved_prompt
    res = client.post(f"/api/prompts/{pid}/versions", headers=headers(owner),
                      json={"blocks": BLOCKS, "model": FREE_MODEL})
    assert res.get_json()["version_id"] == vid


def test_model_change_new_version(client, saved_prompt):
    pid, vid, owner = saved_prompt
    res = client.post(f"/api/prompts/{pid}/versions", headers=headers(owner),
                      json={"blocks": BLOCKS, "model": "openai/gpt-oss-20b:free"})
    assert res.get_json()["version_id"] != vid
    detail = client.get(f"/api/prompts/{pid}", headers=headers(owner)).get_json()
    assert [v["version_num"] for v in detail["versions"]] == [2, 1]


def test_init_idempotent(client, saved_prompt):
    pid, _, owner = saved_prompt
    db.init_db(); db.init_db()
    assert client.get(f"/api/prompts/{pid}", headers=headers(owner)).status_code == 200


# ── B. Owner isolation ──────────────────────────────────────────────

def test_other_owner_cannot_read(client, saved_prompt):
    pid, _, _ = saved_prompt
    assert client.get(f"/api/prompts/{pid}", headers=headers("attacker")).status_code == 404


def test_other_owner_cannot_delete(client, saved_prompt):
    pid, _, owner = saved_prompt
    assert client.delete(f"/api/prompts/{pid}", headers=headers("attacker")).status_code == 404
    assert client.get(f"/api/prompts/{pid}", headers=headers(owner)).status_code == 200


def test_other_owner_cannot_version(client, saved_prompt):
    pid, _, _ = saved_prompt
    res = client.post(f"/api/prompts/{pid}/versions", headers=headers("attacker"),
                      json={"blocks": BLOCKS, "model": FREE_MODEL})
    assert res.status_code == 404


def test_other_owner_cannot_read_runs(client, saved_prompt):
    _, vid, _ = saved_prompt
    db.record_run(vid, FREE_MODEL, "secret output")
    assert client.get(f"/api/versions/{vid}/runs", headers=headers("attacker")).status_code == 404


def test_other_owner_cannot_grade(client, saved_prompt):
    pid, vid, owner = saved_prompt
    client.put(f"/api/prompts/{pid}/checklist", headers=headers(owner),
               json={"items": [{"type": "contains", "label": "x", "value": "x"}]})
    run_id = db.record_run(vid, FREE_MODEL, "x marks the spot")
    res = client.post("/api/grade", headers=headers("attacker"), json={"run_id": run_id})
    assert res.status_code == 404


def test_missing_owner_401(client):
    no_owner = {"Content-Type": "application/json"}
    assert client.get("/api/prompts", headers=no_owner).status_code == 401
    assert client.post("/api/prompts", headers=no_owner,
                       json={"title": "x", "blocks": BLOCKS, "model": FREE_MODEL}).status_code == 401


# ── C. Validation & malformed input ─────────────────────────────────

def test_run_too_short(client):
    res = client.post("/api/run", json={"prompt": "hi", "model": FREE_MODEL})
    assert res.status_code == 400


def test_run_too_long(client):
    res = client.post("/api/run", json={"prompt": "x" * 20_001, "model": FREE_MODEL})
    assert res.status_code == 400


def test_run_unknown_model(client):
    res = client.post("/api/run", json={"prompt": "a valid long prompt", "model": "evil/model"})
    assert res.status_code == 400


def test_run_invalid_json(client):
    res = client.post("/api/run", data="{not json", content_type="application/json")
    assert res.status_code == 400


def test_create_empty_blocks(client, owner):
    res = client.post("/api/prompts", headers=headers(owner),
                      json={"title": "x", "blocks": {"role": "  "}, "model": FREE_MODEL})
    assert res.status_code == 400 and "empty" in res.get_json()["error"]


def test_block_too_long(client, owner):
    blocks = dict(BLOCKS, context="x" * 8001)
    res = client.post("/api/prompts", headers=headers(owner),
                      json={"title": "x", "blocks": blocks, "model": FREE_MODEL})
    assert res.status_code == 400


def test_title_validation(client, owner):
    res = client.post("/api/prompts", headers=headers(owner),
                      json={"title": "", "blocks": BLOCKS, "model": FREE_MODEL})
    assert res.status_code == 400
    res = client.post("/api/prompts", headers=headers(owner),
                      json={"title": "x" * 121, "blocks": BLOCKS, "model": FREE_MODEL})
    assert res.status_code == 400


def test_checklist_validation(client, saved_prompt):
    pid, _, owner = saved_prompt
    bad_type = {"items": [{"type": "nonsense", "label": "x"}]}
    assert client.put(f"/api/prompts/{pid}/checklist", headers=headers(owner),
                      json=bad_type).status_code == 400
    no_label = {"items": [{"type": "contains", "label": " ", "value": "x"}]}
    assert client.put(f"/api/prompts/{pid}/checklist", headers=headers(owner),
                      json=no_label).status_code == 400
    too_many = {"items": [{"type": "contains", "label": f"c{i}", "value": "x"} for i in range(9)]}
    assert client.put(f"/api/prompts/{pid}/checklist", headers=headers(owner),
                      json=too_many).status_code == 400


def test_test_input_validation(client, saved_prompt):
    pid, _, owner = saved_prompt
    res = client.post(f"/api/prompts/{pid}/test-inputs", headers=headers(owner),
                      json={"name": "bad", "values": {"job_posting": 42}})
    assert res.status_code == 400


def test_unknown_ids_404(client, owner):
    assert client.get("/api/prompts/99999", headers=headers(owner)).status_code == 404
    assert client.get("/api/versions/99999/runs", headers=headers(owner)).status_code == 404
    assert client.delete("/api/prompts/1/test-inputs/99999", headers=headers(owner)).status_code == 404


def test_verdict_missing_fields(client):
    res = client.post("/api/verdict", json={"prompt_a": "x", "prompt_b": "y", "output_a": "z"})
    assert res.status_code == 400


# ── E. Unicode round-trip ───────────────────────────────────────────

def test_unicode_roundtrip(client, owner):
    blocks = dict(BLOCKS, role="日本語のキャリアコーチ 🎯", context="مرحبا {{job_posting}} 🚀")
    res = client.post("/api/prompts", headers=headers(owner),
                      json={"title": "Émojí tëst 中文", "blocks": blocks, "model": FREE_MODEL})
    assert res.status_code == 201
    pid = res.get_json()["id"]
    detail = client.get(f"/api/prompts/{pid}", headers=headers(owner)).get_json()
    assert detail["prompt"]["title"] == "Émojí tëst 中文"
    assert detail["versions"][0]["blocks"]["role"] == "日本語のキャリアコーチ 🎯"
    assert "job_posting" in detail["versions"][0]["variables"]


# ── F5-F7. Grading flow ─────────────────────────────────────────────

def _graded_run(client, saved_prompt, output="Hello Stripe team, " + "word " * 10):
    pid, vid, owner = saved_prompt
    client.put(f"/api/prompts/{pid}/checklist", headers=headers(owner),
               json={"items": [
                   {"type": "contains", "label": "mentions Stripe", "value": "stripe"},
                   {"type": "max_words", "label": "under 50 words", "value": "50"},
               ]})
    run_id = db.record_run(vid, FREE_MODEL, output)
    res = client.post("/api/grade", headers=headers(owner), json={"run_id": run_id})
    assert res.status_code == 200, res.get_json()
    return run_id, owner, res.get_json()["grades"]


def test_grade_no_checklist(client, saved_prompt):
    _, vid, owner = saved_prompt
    run_id = db.record_run(vid, FREE_MODEL, "some output")
    res = client.post("/api/grade", headers=headers(owner), json={"run_id": run_id})
    assert res.status_code == 400


def test_override_flow(client, saved_prompt):
    run_id, owner, grades = _graded_run(client, saved_prompt)
    assert grades["passed"] == 2
    res = client.post("/api/grade/override", headers=headers(owner),
                      json={"run_id": run_id, "index": 0, "pass": False})
    g = res.get_json()["grades"]
    assert g["passed"] == 1
    assert g["results"][0]["overridden"] is True


def test_override_bad_index(client, saved_prompt):
    run_id, owner, _ = _graded_run(client, saved_prompt)
    res = client.post("/api/grade/override", headers=headers(owner),
                      json={"run_id": run_id, "index": 99, "pass": True})
    assert res.status_code == 400


# ── G1-G4. Publish ──────────────────────────────────────────────────

def _publish(client, owner, vid, **kw):
    payload = {"version_id": vid, "title": kw.pop("title", "My App"), **kw}
    return client.post("/api/publish", headers=headers(owner), json=payload)


def test_publish_not_owner(client, saved_prompt):
    _, vid, _ = saved_prompt
    assert _publish(client, "attacker", vid).status_code == 404


def test_slug_validation(client, saved_prompt):
    _, vid, owner = saved_prompt
    assert _publish(client, owner, vid, slug="UPPER CASE!").status_code == 400
    ok = _publish(client, owner, vid, slug="my-fixed-slug")
    assert ok.status_code == 201
    assert _publish(client, owner, vid, slug="my-fixed-slug").status_code == 409


def test_slug_from_unicode_title(client, saved_prompt):
    _, vid, owner = saved_prompt
    res = _publish(client, owner, vid, title="日本語タイトル 🎌")
    assert res.status_code == 201
    assert res.get_json()["slug"]   # auto-slug still valid even with no ascii


def test_unpublished_404(client, saved_prompt):
    _, vid, owner = saved_prompt
    slug = _publish(client, owner, vid, slug="soon-hidden").get_json()["slug"]
    assert client.get(f"/t/{slug}").status_code == 200
    client.post(f"/api/my-apps/{slug}/toggle", headers=headers(owner), json={"published": False})
    assert client.get(f"/t/{slug}").status_code == 404
    assert client.post(f"/api/public/run/{slug}", json={"variables": {}}).status_code == 404
    assert client.get("/t/never-existed").status_code == 404


# ── D5-D6. Public variables ─────────────────────────────────────────

def test_public_missing_variable(client, saved_prompt):
    _, vid, owner = saved_prompt
    slug = _publish(client, owner, vid, slug="needs-vars").get_json()["slug"]
    res = client.post(f"/api/public/run/{slug}", json={"variables": {}})
    assert res.status_code == 400 and "job_posting" in res.get_json()["error"]


def test_public_extra_variables_ignored(client, saved_prompt):
    _, vid, owner = saved_prompt
    slug = _publish(client, owner, vid, slug="extra-vars").get_json()["slug"]
    res = client.post(f"/api/public/run/{slug}",
                      json={"variables": {"job_posting": "PM role", "evil_extra": "ignored"}})
    # passes validation; streams (no key -> body carries a friendly error, not a 500)
    assert res.status_code == 200


# ── I. No-key behavior ──────────────────────────────────────────────

def test_run_no_key_friendly_error(client):
    res = client.post("/api/run", json={"prompt": "a perfectly valid prompt", "model": FREE_MODEL})
    assert res.status_code == 200
    body = res.get_data(as_text=True)
    assert "[Error]" in body and "OPENROUTER_API_KEY" in body and "openrouter.ai" in body
