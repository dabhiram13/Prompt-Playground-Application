// Cached demo gallery — zero API cost. Each pair changes ONE thing;
// guided pairs hand off into a live A/B run on the user's own content.

import { state, renderMarkdown, escapeHtml, toast } from "./core.js";
import { loadBlocks } from "./builder.js";
import { setCompareMode } from "./compare.js";

const HEADING_TO_KEY = {
  "Role": "role", "Context": "context", "Task": "task",
  "Output format": "format", "Examples": "examples",
};

// Parse assembled "# Heading\ntext" prompt text back into blocks.
function parseBlocks(promptText) {
  const blocks = { role: "", context: "", task: "", format: "", examples: "" };
  const parts = promptText.split(/^# (Role|Context|Task|Output format|Examples)$/m);
  for (let i = 1; i < parts.length; i += 2) {
    blocks[HEADING_TO_KEY[parts[i]]] = (parts[i + 1] || "").trim();
  }
  return blocks;
}

export async function renderGallery() {
  const list = document.getElementById("gallery-list");
  if (list.dataset.loaded) return;
  const resp = await fetch("/static/data/gallery.json");
  const { pairs } = await resp.json();
  list.dataset.loaded = "1";
  list.innerHTML = "";

  pairs.forEach((pair) => {
    const section = document.createElement("div");
    section.className = "rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden";
    section.innerHTML = `
      <div class="border-b border-gray-100 px-6 py-4">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-base font-semibold">${escapeHtml(pair.title)}</h3>
          ${pair.block_changed ? `<span class="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">changes: ${escapeHtml(pair.block_changed)} block</span>` : ""}
          <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">cached · $0</span>
        </div>
        <p class="mt-1 text-sm text-gray-500">${escapeHtml(pair.lesson)}</p>
      </div>
      <div class="grid gap-0 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        <div class="p-5">
          <p class="text-xs font-semibold text-gray-400">PROMPT A</p>
          <pre class="mt-2 scroll-thin max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 font-mono text-[11px] text-gray-600">${escapeHtml(pair.prompt_a)}</pre>
          <p class="mt-3 text-xs font-semibold text-gray-400">OUTPUT A</p>
          <div class="output-a prose-output mt-2 scroll-thin max-h-56 overflow-auto rounded-md border border-gray-100 p-3 text-sm text-gray-700"></div>
        </div>
        <div class="p-5 bg-emerald-50/30">
          <p class="text-xs font-semibold text-emerald-600">PROMPT B</p>
          <pre class="mt-2 scroll-thin max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-white p-3 font-mono text-[11px] text-gray-600">${escapeHtml(pair.prompt_b)}</pre>
          <p class="mt-3 text-xs font-semibold text-emerald-600">OUTPUT B</p>
          <div class="output-b prose-output mt-2 scroll-thin max-h-56 overflow-auto rounded-md border border-emerald-100 bg-white p-3 text-sm text-gray-700"></div>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
        <p class="flex-1 min-w-[260px] text-sm text-gray-600">💡 ${escapeHtml(pair.annotation)}</p>
        ${pair.guided ? `<button class="try-live shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">⚗ Try this experiment live →</button>` : ""}
      </div>`;
    renderMarkdown(section.querySelector(".output-a"), pair.output_a);
    renderMarkdown(section.querySelector(".output-b"), pair.output_b);
    const tryBtn = section.querySelector(".try-live");
    if (tryBtn) tryBtn.addEventListener("click", () => tryLive(pair));
    list.appendChild(section);
  });
}

function tryLive(pair) {
  // Load B (the better prompt) as variant A, and A (the weaker) as variant B,
  // so the user's first live run REPRODUCES the lesson on a real model.
  loadBlocks(parseBlocks(pair.prompt_b), null, null);
  state.blocksB = parseBlocks(pair.prompt_a);
  setCompareMode(true);
  toast("Loaded! A = with the block, B = without. Swap in your own content, then Run both.");
}
