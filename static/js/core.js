// Shared state, helpers, and API plumbing.

export const state = {
  blocks: emptyBlocks(),
  blocksB: emptyBlocks(),
  compareMode: false,
  isStreaming: false,
  lastOutput: "",
  // library context: set when a saved prompt is loaded into the builder
  currentPromptId: null,
  currentPromptTitle: null,
};

export function emptyBlocks() {
  return { role: "", context: "", task: "", format: "", examples: "" };
}

const BLOCK_HEADINGS = [
  ["role", "Role"], ["context", "Context"], ["task", "Task"],
  ["format", "Output format"], ["examples", "Examples"],
];

export function assemblePrompt(b) {
  const parts = [];
  for (const [key, heading] of BLOCK_HEADINGS) {
    const text = (b[key] || "").trim();
    if (text) parts.push(`# ${heading}\n${text}`);
  }
  return parts.join("\n\n");
}

export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

export function findVariables(text) {
  const re = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_ -]*?)\s*\}\}/g;
  const seen = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1].trim();
    if (!seen.includes(name)) seen.push(name);
  }
  return seen;
}

export function substituteVariables(text, values) {
  return text.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_ -]*?)\s*\}\}/g,
    (_, name) => values[name.trim()] ?? "");
}

export function renderMarkdown(el, text) {
  el.innerHTML = DOMPurify.sanitize(marked.parse(text || ""));
}

export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

// ── anonymous identity ──────────────────────────────────────────────
export function ownerToken() {
  let token = localStorage.getItem("ps_owner_token");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("ps_owner_token", token);
  }
  return token;
}

// ── API helpers ─────────────────────────────────────────────────────
export async function api(path, options = {}) {
  const resp = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Owner-Token": ownerToken(),
      ...(options.headers || {}),
    },
  });
  const data = await resp.json().catch(() => null);
  if (!resp.ok) throw new Error(data?.error ?? `Request failed (${resp.status})`);
  return data;
}

// Stream /api/run into a callback; returns the full text.
export async function streamRun(body, onChunk) {
  const resp = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Owner-Token": ownerToken() },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => null);
    throw new Error(err?.error ?? `Request failed (${resp.status}).`);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onChunk(full);
  }
  return full;
}

export function showModal(html) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" id="modal-overlay">
      <div class="w-full max-w-lg max-h-[85vh] overflow-auto scroll-thin rounded-xl bg-white p-6 shadow-xl">${html}</div>
    </div>`;
  root.querySelector("#modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });
  return root;
}

export function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
}

export function toast(message) {
  const el = document.createElement("div");
  el.className = "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
