"""
Model providers for Prompt Studio — zero-cost by default.

Two backends:
  1. OpenRouter ":free" models — $0 per token (a free API key is still required).
  2. Local Ollama — auto-detected at http://localhost:11434, no key at all.

Paid models are opt-in via ALLOW_PAID_MODELS=1.
"""

import os
import time
import threading

import httpx
from openai import OpenAI

OPENROUTER_BASE = "https://openrouter.ai/api/v1"
OLLAMA_BASE = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
ALLOW_PAID = os.environ.get("ALLOW_PAID_MODELS", "") == "1"

APP_HEADERS = {
    "HTTP-Referer": "https://github.com/dabhiram13/Prompt-Playground-Application",
    "X-Title": "Prompt Studio",
}

# Curated free models, in display order. Verified against the live
# OpenRouter /models endpoint; refreshed automatically every 24h below.
FALLBACK_FREE_MODELS = [
    {"value": "openai/gpt-oss-120b:free",                  "label": "GPT-OSS 120B · free · strong all-rounder"},
    {"value": "meta-llama/llama-3.3-70b-instruct:free",    "label": "Llama 3.3 70B · free · reliable"},
    {"value": "qwen/qwen3-coder:free",                     "label": "Qwen3 Coder · free · best for code"},
    {"value": "google/gemma-4-31b-it:free",                "label": "Gemma 4 31B · free"},
    {"value": "nvidia/nemotron-3-super-120b-a12b:free",    "label": "Nemotron 3 Super 120B · free"},
    {"value": "qwen/qwen3-next-80b-a3b-instruct:free",     "label": "Qwen3 Next 80B · free · fast"},
    {"value": "meta-llama/llama-3.2-3b-instruct:free",     "label": "Llama 3.2 3B · free · tiny (compare vs big!)"},
    {"value": "openai/gpt-oss-20b:free",                   "label": "GPT-OSS 20B · free · fast"},
]

PAID_MODELS = [
    {"value": "openai/gpt-4o-mini",          "label": "GPT-4o Mini · paid"},
    {"value": "openai/gpt-4o",               "label": "GPT-4o · paid"},
    {"value": "anthropic/claude-sonnet-4.5", "label": "Claude Sonnet 4.5 · paid"},
    {"value": "google/gemini-2.5-flash",     "label": "Gemini 2.5 Flash · paid"},
]

DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "openai/gpt-oss-120b:free")
JUDGE_MODEL = os.environ.get("JUDGE_MODEL", "meta-llama/llama-3.3-70b-instruct:free")

_cache_lock = threading.Lock()
_model_cache = {"models": None, "fetched_at": 0.0}
MODEL_CACHE_TTL = 24 * 3600


def _fetch_openrouter_free():
    """Fetch the live model list and keep curated free models that still exist."""
    resp = httpx.get(f"{OPENROUTER_BASE}/models", timeout=8)
    resp.raise_for_status()
    live = {m["id"] for m in resp.json()["data"]
            if float(m["pricing"].get("prompt", 1) or 0) == 0
            and float(m["pricing"].get("completion", 1) or 0) == 0}
    kept = [m for m in FALLBACK_FREE_MODELS if m["value"] in live]
    return kept or FALLBACK_FREE_MODELS


def _detect_ollama():
    """Return locally available Ollama models, or [] when Ollama isn't running."""
    try:
        resp = httpx.get(f"{OLLAMA_BASE}/api/tags", timeout=1.5)
        resp.raise_for_status()
        tags = resp.json().get("models", [])
        return [{"value": f"ollama/{t['name']}", "label": f"{t['name']} · local · no key needed"}
                for t in tags]
    except Exception:
        return []


def get_models():
    """Current model list: free OpenRouter models + local Ollama (+ paid if opted in)."""
    with _cache_lock:
        fresh = time.time() - _model_cache["fetched_at"] < MODEL_CACHE_TTL
        if not (_model_cache["models"] and fresh):
            try:
                free = _fetch_openrouter_free()
            except Exception:
                free = FALLBACK_FREE_MODELS
            _model_cache["models"] = free
            _model_cache["fetched_at"] = time.time()
        free_models = list(_model_cache["models"])

    models = free_models + _detect_ollama()
    if ALLOW_PAID:
        models += PAID_MODELS
    return models


def is_known_model(model_id):
    return any(m["value"] == model_id for m in get_models())


def _client_for(model_id):
    """Return (openai_client, backend_model_id) for the given model."""
    if model_id.startswith("ollama/"):
        client = OpenAI(base_url=f"{OLLAMA_BASE}/v1", api_key="ollama")
        return client, model_id.removeprefix("ollama/")
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not set. Get a FREE key at https://openrouter.ai/keys "
            "(free models cost $0) — or run Ollama locally for keyless use."
        )
    return OpenAI(base_url=OPENROUTER_BASE, api_key=api_key), model_id


def chat_stream(model_id, messages):
    """Yield response text deltas for a chat completion."""
    client, backend_model = _client_for(model_id)
    extra = {} if model_id.startswith("ollama/") else {"extra_headers": APP_HEADERS}
    stream = client.chat.completions.create(
        model=backend_model, messages=messages, stream=True, **extra)
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


def chat_complete(model_id, messages, max_tokens=1024):
    """Non-streaming completion. Returns (text, total_tokens)."""
    client, backend_model = _client_for(model_id)
    extra = {} if model_id.startswith("ollama/") else {"extra_headers": APP_HEADERS}
    resp = client.chat.completions.create(
        model=backend_model, messages=messages, max_tokens=max_tokens, **extra)
    text = resp.choices[0].message.content or ""
    total = resp.usage.total_tokens if resp.usage else 0
    return text, total
