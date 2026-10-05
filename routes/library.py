"""Prompt library CRUD — prompts, versions, test inputs, checklists (Phases 2-3)."""

import json

from flask import Blueprint, Response, request

import db
import promptkit

bp = Blueprint("library", __name__)

MAX_TITLE_LEN = 120
MAX_BLOCK_LEN = 8_000
MAX_CHECKLIST_ITEMS = 8
VALID_CHECK_TYPES = {"max_words", "min_words", "contains", "not_contains", "judge"}


def _json(data, status=200):
    return Response(json.dumps(data), status=status, content_type="application/json")


def _error(message, status=400):
    return _json({"error": message}, status)


def _owner():
    return (request.headers.get("X-Owner-Token") or "").strip()


def _validate_blocks(blocks):
    if not isinstance(blocks, dict):
        return "blocks must be an object"
    clean = {}
    for key, _ in promptkit.BLOCK_ORDER:
        value = blocks.get(key, "")
        if not isinstance(value, str):
            return f"block '{key}' must be a string"
        if len(value) > MAX_BLOCK_LEN:
            return f"block '{key}' is too long (max {MAX_BLOCK_LEN} chars)"
        clean[key] = value
    if not promptkit.assemble_prompt(clean):
        return "prompt is empty"
    return clean


@bp.post("/api/prompts")
def create_prompt():
    owner = _owner()
    if not owner:
        return _error("Missing owner token.", 401)
    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    if not title or len(title) > MAX_TITLE_LEN:
        return _error(f"Title is required (max {MAX_TITLE_LEN} chars).")
    blocks = _validate_blocks(body.get("blocks") or {})
    if isinstance(blocks, str):
        return _error(blocks)
    model = (body.get("model") or "").strip()
    prompt_id = db.create_prompt(owner, title, blocks, model)
    return _json({"id": prompt_id, "version": 1}, 201)


@bp.get("/api/prompts")
def list_prompts():
    owner = _owner()
    if not owner:
        return _error("Missing owner token.", 401)
    return _json({"prompts": db.list_prompts(owner)})


@bp.get("/api/prompts/<int:prompt_id>")
def get_prompt(prompt_id):
    owner = _owner()
    prompt = db.get_prompt(prompt_id, owner)
    if not prompt:
        return _error("Prompt not found.", 404)
    versions = db.list_versions(prompt_id)
    for v in versions:
        assembled = promptkit.assemble_prompt(v["blocks"])
        v["variables"] = promptkit.find_variables(assembled)
    return _json({
        "prompt": prompt,
        "versions": versions,
        "test_inputs": db.list_test_inputs(prompt_id),
        "checklist": db.get_checklist(prompt_id),
    })


@bp.delete("/api/prompts/<int:prompt_id>")
def delete_prompt(prompt_id):
    if not db.delete_prompt(prompt_id, _owner()):
        return _error("Prompt not found.", 404)
    return _json({"ok": True})


@bp.post("/api/prompts/<int:prompt_id>/versions")
def save_version(prompt_id):
    owner = _owner()
    body = request.get_json(silent=True) or {}
    blocks = _validate_blocks(body.get("blocks") or {})
    if isinstance(blocks, str):
        return _error(blocks)
    model = (body.get("model") or "").strip()
    version_id = db.save_version(prompt_id, owner, blocks, model)
    if version_id is None:
        return _error("Prompt not found.", 404)
    return _json({"version_id": version_id}, 201)


@bp.post("/api/prompts/<int:prompt_id>/test-inputs")
def add_test_input(prompt_id):
    owner = _owner()
    if not db.get_prompt(prompt_id, owner):
        return _error("Prompt not found.", 404)
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    values = body.get("values") or {}
    if not name:
        return _error("Test input needs a name.")
    if not isinstance(values, dict) or not all(isinstance(v, str) for v in values.values()):
        return _error("values must be an object of strings.")
    test_id = db.create_test_input(prompt_id, name, values)
    return _json({"id": test_id}, 201)


@bp.delete("/api/prompts/<int:prompt_id>/test-inputs/<int:test_id>")
def remove_test_input(prompt_id, test_id):
    owner = _owner()
    if not db.get_prompt(prompt_id, owner):
        return _error("Prompt not found.", 404)
    if not db.delete_test_input(test_id, prompt_id):
        return _error("Test input not found.", 404)
    return _json({"ok": True})


@bp.put("/api/prompts/<int:prompt_id>/checklist")
def put_checklist(prompt_id):
    owner = _owner()
    if not db.get_prompt(prompt_id, owner):
        return _error("Prompt not found.", 404)
    body = request.get_json(silent=True) or {}
    items = body.get("items") or []
    if not isinstance(items, list) or len(items) > MAX_CHECKLIST_ITEMS:
        return _error(f"items must be a list of at most {MAX_CHECKLIST_ITEMS} checks.")
    for item in items:
        if not isinstance(item, dict) or item.get("type") not in VALID_CHECK_TYPES:
            return _error(f"Each check needs a type in {sorted(VALID_CHECK_TYPES)}.")
        if not (item.get("label") or "").strip():
            return _error("Each check needs a label.")
    db.save_checklist(prompt_id, items)
    return _json({"ok": True})


@bp.get("/api/versions/<int:version_id>/runs")
def version_runs(version_id):
    version = db.get_version(version_id)
    if not version:
        return _error("Version not found.", 404)
    prompt = db.get_prompt(version["prompt_id"], _owner())
    if not prompt:
        return _error("Version not found.", 404)
    return _json({"runs": db.list_runs(version_id)})
