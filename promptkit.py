"""Prompt assembly and {{variable}} handling shared across routes."""

import re

BLOCK_ORDER = [
    ("role", "Role"),
    ("context", "Context"),
    ("task", "Task"),
    ("format", "Output format"),
    ("examples", "Examples"),
]

VARIABLE_RE = re.compile(r"\{\{\s*([a-zA-Z_][a-zA-Z0-9_ -]*?)\s*\}\}")


def assemble_prompt(blocks):
    """Join non-empty blocks into the canonical 5-block prompt text."""
    parts = []
    for key, heading in BLOCK_ORDER:
        text = (blocks.get(key) or "").strip()
        if text:
            parts.append(f"# {heading}\n{text}")
    return "\n\n".join(parts)


def find_variables(text):
    """Unique {{variable}} names in order of first appearance."""
    seen = []
    for name in VARIABLE_RE.findall(text):
        cleaned = name.strip()
        if cleaned not in seen:
            seen.append(cleaned)
    return seen


def substitute(text, variables, wrap=None):
    """Replace {{name}} with its value; optionally wrap each value (public runs)."""
    def repl(match):
        name = match.group(1).strip()
        value = variables.get(name, "")
        return wrap(value) if wrap else value
    return VARIABLE_RE.sub(repl, text)
