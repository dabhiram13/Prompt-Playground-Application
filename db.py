"""
SQLite persistence for Prompt Studio — stdlib sqlite3, WAL mode, no ORM.

The database path defaults to ./prompt_studio.db and can be overridden with
DATABASE_PATH (point it at a mounted volume in production, e.g. Railway).
"""

import json
import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "prompt_studio.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_token TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_prompts_owner ON prompts(owner_token);

CREATE TABLE IF NOT EXISTS prompt_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_id INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version_num INTEGER NOT NULL,
  blocks_json TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (prompt_id, version_num)
);

CREATE TABLE IF NOT EXISTS test_inputs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_id INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  values_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS checklists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_id INTEGER NOT NULL UNIQUE REFERENCES prompts(id) ON DELETE CASCADE,
  items_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id INTEGER NOT NULL REFERENCES prompt_versions(id) ON DELETE CASCADE,
  test_input_id INTEGER REFERENCES test_inputs(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  output TEXT NOT NULL,
  grades_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_runs_version ON runs(version_id);

CREATE TABLE IF NOT EXISTS published_apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  version_id INTEGER NOT NULL REFERENCES prompt_versions(id) ON DELETE CASCADE,
  owner_token TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  show_prompt INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  run_count INTEGER NOT NULL DEFAULT 0,
  tokens_today INTEGER NOT NULL DEFAULT 0,
  tokens_date TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
"""


def init_db():
    with get_db() as conn:
        conn.executescript(SCHEMA)


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def row_to_dict(row):
    return dict(row) if row is not None else None


def rows_to_list(rows):
    return [dict(r) for r in rows]


# ── Prompts & versions ──────────────────────────────────────────────


def create_prompt(owner_token, title, blocks, model):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO prompts (owner_token, title) VALUES (?, ?)",
            (owner_token, title))
        prompt_id = cur.lastrowid
        conn.execute(
            "INSERT INTO prompt_versions (prompt_id, version_num, blocks_json, model) "
            "VALUES (?, 1, ?, ?)",
            (prompt_id, json.dumps(blocks), model))
        return prompt_id


def list_prompts(owner_token):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT p.*, "
            "  (SELECT MAX(version_num) FROM prompt_versions v WHERE v.prompt_id = p.id) AS latest_version, "
            "  (SELECT COUNT(*) FROM prompt_versions v JOIN runs r ON r.version_id = v.id "
            "   WHERE v.prompt_id = p.id) AS run_count "
            "FROM prompts p WHERE p.owner_token = ? ORDER BY p.updated_at DESC",
            (owner_token,)).fetchall()
        return rows_to_list(rows)


def get_prompt(prompt_id, owner_token):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM prompts WHERE id = ? AND owner_token = ?",
            (prompt_id, owner_token)).fetchone()
        return row_to_dict(row)


def delete_prompt(prompt_id, owner_token):
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM prompts WHERE id = ? AND owner_token = ?",
            (prompt_id, owner_token))
        return cur.rowcount > 0


def list_versions(prompt_id):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM prompt_versions WHERE prompt_id = ? ORDER BY version_num DESC",
            (prompt_id,)).fetchall()
        out = rows_to_list(rows)
        for v in out:
            v["blocks"] = json.loads(v.pop("blocks_json"))
        return out


def get_version(version_id):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM prompt_versions WHERE id = ?", (version_id,)).fetchone()
        v = row_to_dict(row)
        if v:
            v["blocks"] = json.loads(v.pop("blocks_json"))
        return v


def save_version(prompt_id, owner_token, blocks, model):
    """Snapshot a new version; reuse the latest one when content is identical."""
    blocks_json = json.dumps(blocks)
    with get_db() as conn:
        owner = conn.execute(
            "SELECT id FROM prompts WHERE id = ? AND owner_token = ?",
            (prompt_id, owner_token)).fetchone()
        if not owner:
            return None
        latest = conn.execute(
            "SELECT * FROM prompt_versions WHERE prompt_id = ? "
            "ORDER BY version_num DESC LIMIT 1", (prompt_id,)).fetchone()
        if latest and latest["blocks_json"] == blocks_json and latest["model"] == model:
            return latest["id"]
        next_num = (latest["version_num"] + 1) if latest else 1
        cur = conn.execute(
            "INSERT INTO prompt_versions (prompt_id, version_num, blocks_json, model) "
            "VALUES (?, ?, ?, ?)", (prompt_id, next_num, blocks_json, model))
        conn.execute("UPDATE prompts SET updated_at = datetime('now') WHERE id = ?",
                     (prompt_id,))
        return cur.lastrowid


# ── Test inputs ─────────────────────────────────────────────────────


def list_test_inputs(prompt_id):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM test_inputs WHERE prompt_id = ? ORDER BY id",
            (prompt_id,)).fetchall()
        out = rows_to_list(rows)
        for t in out:
            t["values"] = json.loads(t.pop("values_json"))
        return out


def create_test_input(prompt_id, name, values):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO test_inputs (prompt_id, name, values_json) VALUES (?, ?, ?)",
            (prompt_id, name, json.dumps(values)))
        return cur.lastrowid


def delete_test_input(test_input_id, prompt_id):
    with get_db() as conn:
        cur = conn.execute(
            "DELETE FROM test_inputs WHERE id = ? AND prompt_id = ?",
            (test_input_id, prompt_id))
        return cur.rowcount > 0


# ── Checklists ──────────────────────────────────────────────────────


def get_checklist(prompt_id):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM checklists WHERE prompt_id = ?", (prompt_id,)).fetchone()
        c = row_to_dict(row)
        if c:
            c["items"] = json.loads(c.pop("items_json"))
        return c


def save_checklist(prompt_id, items):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO checklists (prompt_id, items_json) VALUES (?, ?) "
            "ON CONFLICT(prompt_id) DO UPDATE SET items_json = excluded.items_json, "
            "updated_at = datetime('now')",
            (prompt_id, json.dumps(items)))


# ── Runs ────────────────────────────────────────────────────────────


def record_run(version_id, model, output, test_input_id=None, grades=None):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO runs (version_id, test_input_id, model, output, grades_json) "
            "VALUES (?, ?, ?, ?, ?)",
            (version_id, test_input_id, model, output,
             json.dumps(grades) if grades is not None else None))
        return cur.lastrowid


def update_run_grades(run_id, grades):
    with get_db() as conn:
        conn.execute("UPDATE runs SET grades_json = ? WHERE id = ?",
                     (json.dumps(grades), run_id))


def list_runs(version_id):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM runs WHERE version_id = ? ORDER BY id DESC LIMIT 50",
            (version_id,)).fetchall()
        out = rows_to_list(rows)
        for r in out:
            g = r.pop("grades_json")
            r["grades"] = json.loads(g) if g else None
        return out


# ── Published apps ──────────────────────────────────────────────────


def create_published_app(slug, version_id, owner_token, title, description, show_prompt):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO published_apps (slug, version_id, owner_token, title, description, show_prompt) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (slug, version_id, owner_token, title, description, 1 if show_prompt else 0))
        return cur.lastrowid


def get_published_app(slug):
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM published_apps WHERE slug = ?", (slug,)).fetchone()
        return row_to_dict(row)


def list_published_apps(owner_token):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM published_apps WHERE owner_token = ? ORDER BY created_at DESC",
            (owner_token,)).fetchall()
        return rows_to_list(rows)


def set_published(slug, owner_token, published):
    with get_db() as conn:
        cur = conn.execute(
            "UPDATE published_apps SET published = ? WHERE slug = ? AND owner_token = ?",
            (1 if published else 0, slug, owner_token))
        return cur.rowcount > 0


def add_app_usage(slug, tokens, today):
    """Record a public run; resets the daily token counter on date change."""
    with get_db() as conn:
        conn.execute(
            "UPDATE published_apps SET "
            "  run_count = run_count + 1, "
            "  tokens_today = CASE WHEN tokens_date = ? THEN tokens_today + ? ELSE ? END, "
            "  tokens_date = ? "
            "WHERE slug = ?",
            (today, tokens, tokens, today, slug))


def get_global_tokens(today):
    with get_db() as conn:
        row = conn.execute("SELECT value FROM meta WHERE key = ?",
                           (f"global_tokens:{today}",)).fetchone()
        return int(row["value"]) if row else 0


def add_global_tokens(tokens, today):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO meta (key, value) VALUES (?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value = CAST(value AS INTEGER) + ?",
            (f"global_tokens:{today}", str(tokens), tokens))
