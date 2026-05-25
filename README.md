# Prompt Playground — Interactive Prompt Engineering Tool

> **Python · OpenAI API (via OpenRouter) · Web UI**

A hands-on educational platform that helps users learn prompt engineering by experimenting with prompts in real time and observing how output changes.

Demonstrates the impact of **phrasing, context, constraints, examples, and output structure** on LLM responses — turning abstract prompt theory into something users can see and feel.

Designed for beginners exploring AI as well as developers iterating on prompts for real applications.

---

## Features

- **5-block prompt framework** — Role, Context, Task, Format, Examples
- **Live assembled prompt** — updates as you type with token estimate
- **Real-time streaming** — responses stream token-by-token via OpenRouter
- **6 built-in templates** — resume rewriter, code reviewer, ELI5, email reply, meeting summarizer, blog outline
- **Multi-model support** — GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Flash, and more
- **Copy prompt** — one-click copy of the assembled prompt

---

## Stack

| Layer    | Tech                                  |
|----------|---------------------------------------|
| Backend  | Python 3.11+ · Flask                  |
| AI API   | OpenAI SDK → OpenRouter               |
| Frontend | HTML/CSS/JS · Tailwind CSS (CDN)      |

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/dabhiram13/Prompt-Playground-Application.git
cd Prompt-Playground-Application
```

### 2. Install Python dependencies

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set your OpenRouter API key

```bash
cp .env.example .env
# Edit .env and paste your key from https://openrouter.ai/keys
```

### 4. Run

```bash
python app.py
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable             | Required | Description                     |
|----------------------|----------|---------------------------------|
| `OPENROUTER_API_KEY` | ✅        | Get a free key at openrouter.ai |
| `PORT`               | ❌        | Server port (default: `3000`)   |

---

## License

MIT
