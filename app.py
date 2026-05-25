"""
Prompt Playground — Interactive Prompt Engineering Tool
Python + OpenAI SDK (via OpenRouter) + Flask Web UI
"""

import os
import json

from flask import Flask, render_template, request, Response, stream_with_context
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

# Use a placeholder key so the OpenAI client can be instantiated without crashing
# at startup when OPENROUTER_API_KEY is not yet set; the real key is passed per-request.
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY or "not-set",
)

MODELS = [
    {"value": "openai/gpt-4o-mini",         "label": "OpenAI · GPT-4o Mini (fast, cheap)"},
    {"value": "openai/gpt-4o",               "label": "OpenAI · GPT-4o"},
    {"value": "anthropic/claude-3-haiku",    "label": "Anthropic · Claude 3 Haiku"},
    {"value": "anthropic/claude-3.5-sonnet", "label": "Anthropic · Claude 3.5 Sonnet"},
    {"value": "google/gemini-2.0-flash",     "label": "Google · Gemini 2.0 Flash"},
]


@app.route("/")
def index():
    return render_template("index.html", models=MODELS)


@app.route("/api/run", methods=["POST"])
def run_prompt():
    """
    POST /api/run
    Body: { "prompt": "...", "model": "openai/gpt-4o-mini" }
    Returns a plain-text streaming response.
    """
    try:
        body = request.get_json(force=True)
    except Exception:
        return Response(json.dumps({"error": "Invalid JSON body."}),
                        status=400, content_type="application/json")

    prompt = (body or {}).get("prompt", "").strip()
    model  = (body or {}).get("model", "openai/gpt-4o-mini")

    if len(prompt) < 10:
        return Response(json.dumps({"error": "Prompt is too short (min 10 chars)."}),
                        status=400, content_type="application/json")

    if len(prompt) > 20_000:
        return Response(json.dumps({"error": "Prompt is too long (max 20 000 chars)."}),
                        status=400, content_type="application/json")

    if not OPENROUTER_API_KEY:
        return Response(
            json.dumps({
                "error": (
                    "OPENROUTER_API_KEY is not set. "
                    "Get a free key at https://openrouter.ai and add it to .env."
                )
            }),
            status=500,
            content_type="application/json",
        )

    def generate():
        try:
            stream = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                stream=True,
                extra_headers={
                    "HTTP-Referer": "https://github.com/dabhiram13/Prompt-Playground-Application",
                    "X-Title": "Prompt Playground",
                },
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
        except Exception as exc:
            yield f"\n\n[Error] {exc}"

    return Response(stream_with_context(generate()), content_type="text/plain; charset=utf-8")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(debug=True, port=port)
