"""
Abuse controls for public mini-app runs (Phase 4).

All limits are conservative because public visitors spend the owner's
OpenRouter quota (free models: $0 but rate-limited; paid: real money).
"""

import os
import time
import threading
from collections import deque
from datetime import date

import db

# Per-IP: max requests per sliding window (across all public apps).
IP_MAX_REQUESTS = int(os.environ.get("PUBLIC_IP_MAX_REQUESTS", 10))
IP_WINDOW_SECONDS = int(os.environ.get("PUBLIC_IP_WINDOW_SECONDS", 600))

# Per-app and global daily token budgets (hard stops).
APP_DAILY_TOKEN_BUDGET = int(os.environ.get("PUBLIC_APP_DAILY_TOKENS", 200_000))
GLOBAL_DAILY_TOKEN_BUDGET = int(os.environ.get("PUBLIC_GLOBAL_DAILY_TOKENS", 1_000_000))

# Kill switch: set PUBLIC_APPS_DISABLED=1 to stop all public runs instantly.
PUBLIC_APPS_DISABLED = os.environ.get("PUBLIC_APPS_DISABLED", "") == "1"

# Visitor input caps.
MAX_VARIABLE_LENGTH = 4_000
MAX_TOTAL_INPUT_LENGTH = 12_000

_ip_lock = threading.Lock()
_ip_hits = {}  # ip -> deque[timestamps]


def check_rate_limit(ip):
    """Sliding-window per-IP limit. Returns an error string or None."""
    now = time.time()
    with _ip_lock:
        hits = _ip_hits.setdefault(ip, deque())
        while hits and now - hits[0] > IP_WINDOW_SECONDS:
            hits.popleft()
        if len(hits) >= IP_MAX_REQUESTS:
            return "Rate limit reached — try again in a few minutes."
        hits.append(now)
    return None


def check_budgets(app_row):
    """Daily token budgets, app-level and global. Returns an error string or None."""
    if PUBLIC_APPS_DISABLED:
        return "Public apps are temporarily disabled by the operator."
    today = date.today().isoformat()
    app_tokens = app_row["tokens_today"] if app_row["tokens_date"] == today else 0
    if app_tokens >= APP_DAILY_TOKEN_BUDGET:
        return "This app hit its free daily usage limit — come back tomorrow."
    if db.get_global_tokens(today) >= GLOBAL_DAILY_TOKEN_BUDGET:
        return "The site hit its free daily usage limit — come back tomorrow."
    return None


def validate_visitor_inputs(variables):
    """Length caps + light screening on visitor-supplied variable values."""
    total = 0
    for name, value in variables.items():
        if not isinstance(value, str):
            return f"Variable '{name}' must be text."
        if len(value) > MAX_VARIABLE_LENGTH:
            return f"Variable '{name}' is too long (max {MAX_VARIABLE_LENGTH} chars)."
        total += len(value)
    if total > MAX_TOTAL_INPUT_LENGTH:
        return f"Inputs are too long overall (max {MAX_TOTAL_INPUT_LENGTH} chars)."
    return None


def record_usage(slug, tokens):
    today = date.today().isoformat()
    db.add_app_usage(slug, tokens, today)
    db.add_global_tokens(tokens, today)


def wrap_visitor_value(value):
    """Delimit visitor input so the model treats it as data, not instructions."""
    return f"<user_input>\n{value}\n</user_input>"
