"""Public mini-apps — Phase 4. Publish a version at /t/<slug>; visitors run it
with no account and no key. Abuse controls live in abuse.py and gate every run."""

import json
import re
import secrets

from flask import Blueprint, Response, render_template, request, stream_with_context

import abuse
import db
import promptkit
import providers

bp = Blueprint("publish", __name__)

SLUG_RE = re.compile(r"^[a-z0-9-]{3,60}$")


def _json(data, status=200):
    return Response(json.dumps(data), status=status, content_type="application/json")


def _owner():
    return (request.headers.get("X-Owner-Token") or "").strip()


def _slugify(title):
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:48] or "app"
    return f"{base}-{secrets.token_hex(2)}"


def _client_ip():
    fwd = request.headers.get("X-Forwarded-For", "")
    return fwd.split(",")[0].strip() if fwd else (request.remote_addr or "?")


def _public_model(version_model):
    """Pin public runs to $0 models: keep the version's model only if it's free."""
    if version_model.endswith(":free") or version_model.startswith("ollama/"):
        return version_model
    return providers.DEFAULT_MODEL


@bp.post("/api/publish")
def publish():
    owner = _owner()
    if not owner:
        return _json({"error": "Missing owner token."}, 401)
    body = request.get_json(silent=True) or {}
    version_id = body.get("version_id")
    title = (body.get("title") or "").strip()
    if not version_id or not title:
        return _json({"error": "version_id and title are required."}, 400)
    version = db.get_version(version_id)
    if not version or not db.get_prompt(version["prompt_id"], owner):
        return _json({"error": "Version not found."}, 404)
    slug = (body.get("slug") or "").strip() or _slugify(title)
    if not SLUG_RE.match(slug):
        return _json({"error": "Slug must be 3-60 chars: a-z, 0-9, dashes."}, 400)
    if db.get_published_app(slug):
        return _json({"error": "That slug is taken — pick another."}, 409)
    db.create_published_app(slug, version_id, owner, title,
                            (body.get("description") or "").strip()[:500],
                            bool(body.get("show_prompt")))
    return _json({"slug": slug, "url": f"/t/{slug}"}, 201)


@bp.get("/api/my-apps")
def my_apps():
    owner = _owner()
    if not owner:
        return _json({"error": "Missing owner token."}, 401)
    return _json({"apps": db.list_published_apps(owner)})


@bp.post("/api/my-apps/<slug>/toggle")
def toggle_app(slug):
    body = request.get_json(silent=True) or {}
    if not db.set_published(slug, _owner(), bool(body.get("published"))):
        return _json({"error": "App not found."}, 404)
    return _json({"ok": True})


@bp.get("/t/<slug>")
def public_page(slug):
    app_row = db.get_published_app(slug)
    if not app_row or not app_row["published"]:
        return render_template("public_app.html", app=None, variables=[],
                               prompt_text=None), 404
    version = db.get_version(app_row["version_id"])
    assembled = promptkit.assemble_prompt(version["blocks"])
    variables = promptkit.find_variables(assembled)
    return render_template(
        "public_app.html", app=app_row, variables=variables,
        prompt_text=assembled if app_row["show_prompt"] else None,
        model=_public_model(version["model"]))


@bp.post("/api/public/run/<slug>")
def public_run(slug):
    app_row = db.get_published_app(slug)
    if not app_row or not app_row["published"]:
        return _json({"error": "This app is not available."}, 404)

    err = abuse.check_rate_limit(_client_ip())
    if err:
        return _json({"error": err}, 429)
    err = abuse.check_budgets(app_row)
    if err:
        return _json({"error": err}, 429)

    body = request.get_json(silent=True) or {}
    variables = body.get("variables") or {}
    if not isinstance(variables, dict):
        return _json({"error": "variables must be an object."}, 400)
    err = abuse.validate_visitor_inputs(variables)
    if err:
        return _json({"error": err}, 400)

    version = db.get_version(app_row["version_id"])
    assembled = promptkit.assemble_prompt(version["blocks"])
    expected = set(promptkit.find_variables(assembled))
    missing = [v for v in expected if not (variables.get(v) or "").strip()]
    if missing:
        return _json({"error": f"Please fill in: {', '.join(missing)}"}, 400)

    prompt = promptkit.substitute(assembled, variables, wrap=abuse.wrap_visitor_value)
    model = _public_model(version["model"])

    def generate():
        chars = 0
        try:
            for delta in providers.chat_stream(model, [{"role": "user", "content": prompt}]):
                chars += len(delta)
                yield delta
        except Exception:
            yield "\n\n[Error] The model is busy — please try again in a minute."
        finally:
            approx_tokens = (len(prompt) + chars) // 4
            try:
                abuse.record_usage(slug, approx_tokens)
            except Exception:
                pass

    return Response(stream_with_context(generate()),
                    content_type="text/plain; charset=utf-8")


@bp.get("/api/remix/<slug>")
def remix(slug):
    """Hand the full prompt (blocks + variables) to a visitor's builder."""
    app_row = db.get_published_app(slug)
    if not app_row or not app_row["published"]:
        return _json({"error": "This app is not available."}, 404)
    version = db.get_version(app_row["version_id"])
    assembled = promptkit.assemble_prompt(version["blocks"])
    return _json({
        "title": app_row["title"],
        "blocks": version["blocks"],
        "model": _public_model(version["model"]),
        "variables": promptkit.find_variables(assembled),
    })
