// Block editors, live preview, variables, single-run, refine chips.

import { BLOCK_SPECS, TEMPLATES } from "./data.js";
import {
  state, emptyBlocks, assemblePrompt, estimateTokens, findVariables,
  substituteVariables, renderMarkdown, escapeHtml, streamRun, toast,
} from "./core.js";

const DRAFT_KEY = "ps_draft";

const variableValues = {};   // shared fill-ins for {{vars}} across A and B

export function selectedModel() {
  return document.getElementById("model-select").value;
}

function isFreeModel(model) {
  return model.endsWith(":free") || model.startsWith("ollama/");
}

// ── block editors (used for variant A and B) ───────────────────────
export function renderEditor(containerId, blocksRef, { withAblate } = {}) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  BLOCK_SPECS.forEach((spec, i) => {
    const div = document.createElement("div");
    div.className = "rounded-xl border border-gray-200 bg-white p-4 shadow-sm";
    div.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700">${i + 1}</span>
        <label class="text-sm font-medium text-gray-700">${spec.label}</label>
        ${spec.optional ? '<span class="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">Optional</span>' : ""}
        <span class="group relative ml-1 inline-flex h-5 w-5 cursor-help items-center justify-center text-gray-400" title="${escapeHtml(spec.why)}">ⓘ</span>
        ${withAblate ? `<button type="button" data-ablate="${spec.key}" title="Run an A/B comparison with this block removed"
          class="ml-auto rounded-md border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-colors">⚗ what if removed?</button>` : ""}
      </div>
      <textarea data-block="${spec.key}" rows="${spec.rows}" placeholder="${escapeHtml(spec.placeholder)}"
        class="mt-3 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition">${escapeHtml(blocksRef[spec.key])}</textarea>
      ${spec.chips ? `<div class="mt-2 flex flex-wrap gap-1.5">${spec.chips.map(chip =>
        `<button type="button" data-chip="${escapeHtml(chip)}" data-key="${spec.key}"
          class="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">+ ${escapeHtml(chip)}</button>`).join("")}</div>` : ""}
    `;
    container.appendChild(div);

    div.querySelector("textarea").addEventListener("input", (e) => {
      blocksRef[spec.key] = e.target.value;
      updatePreview();
    });
    div.querySelectorAll("[data-chip]").forEach(btn => {
      btn.addEventListener("click", () => {
        const { key, chip } = btn.dataset;
        blocksRef[key] = blocksRef[key] ? `${blocksRef[key]}, ${chip.toLowerCase()}` : chip;
        div.querySelector("textarea").value = blocksRef[key];
        updatePreview();
      });
    });
  });
}

// ── templates strip ─────────────────────────────────────────────────
export function renderTemplates() {
  const container = document.getElementById("templates");
  container.innerHTML = "";
  TEMPLATES.forEach(t => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "group flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md";
    btn.innerHTML = `
      <span class="text-xl leading-none">${t.emoji}</span>
      <span class="flex-1">
        <span class="block text-sm font-medium text-gray-800">${t.name}</span>
        <span class="mt-0.5 block text-xs text-gray-500">${t.description}</span>
      </span>`;
    btn.addEventListener("click", () => loadBlocks(t.blocks, null, null));
    container.appendChild(btn);
  });
}

export function loadBlocks(blocks, promptId, title) {
  state.blocks = { ...emptyBlocks(), ...blocks };
  state.currentPromptId = promptId;
  state.currentPromptTitle = title;
  document.getElementById("builder-title").textContent =
    title ? `Editing: ${title}` : "Build your prompt";
  renderEditor("editor-a", state.blocks, { withAblate: true });
  updatePreview();
  clearOutput();
  document.querySelector('[data-view="build"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── preview + variables ─────────────────────────────────────────────
// Unsaved work survives a reload: the draft mirrors the builder into
// localStorage on every change and is restored on load (edge case A6).
export function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      blocks: state.blocks,
      model: document.getElementById("model-select").value,
      promptId: state.currentPromptId,
      title: state.currentPromptTitle,
    }));
  } catch { /* storage full/blocked — drafts are best-effort */ }
}

export function restoreDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return false;
    const draft = JSON.parse(raw);
    if (!draft.blocks || !assemblePrompt(draft.blocks)) return false;
    state.blocks = { ...emptyBlocks(), ...draft.blocks };
    state.currentPromptId = draft.promptId ?? null;
    state.currentPromptTitle = draft.title ?? null;
    if (draft.model) {
      const select = document.getElementById("model-select");
      if ([...select.options].some(o => o.value === draft.model)) select.value = draft.model;
    }
    if (draft.title) document.getElementById("builder-title").textContent = `Editing: ${draft.title}`;
    return true;
  } catch { return false; }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function updatePreview() {
  const assembled = assemblePrompt(state.blocks);
  saveDraft();
  const preview = document.getElementById("assembled-preview");
  const model = selectedModel();

  preview.textContent = assembled ||
    "Your assembled prompt appears here as you fill in blocks.";
  preview.className = `whitespace-pre-wrap break-words font-mono text-xs leading-relaxed ${assembled ? "text-gray-800" : "text-gray-400"}`;

  const cost = isFreeModel(model) ? "$0.00 · free" : "paid model!";
  document.getElementById("token-count").textContent =
    `~${estimateTokens(assembled)} tokens · ${cost}`;
  document.getElementById("copy-btn").disabled = !assembled;
  document.getElementById("run-btn").disabled = !assembled || state.isStreaming;

  renderVariablesPanel("variables-panel", assembled);
  if (state.compareMode) {
    const bothText = assembled + assemblePrompt(state.blocksB);
    document.getElementById("compare-cost").textContent =
      `~${estimateTokens(bothText)} tokens total · ${isFreeModel(model) ? "$0.00 on free models" : "PAID models selected"}`;
    renderVariablesPanel("compare-variables", bothText);
  }
}

function renderVariablesPanel(panelId, text) {
  const panel = document.getElementById(panelId);
  const vars = findVariables(text);
  if (!vars.length) { panel.classList.add("hidden"); panel.innerHTML = ""; return; }
  panel.classList.remove("hidden");
  panel.innerHTML = `<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Fill in variables</p>` +
    vars.map(v => `
      <div class="flex items-start gap-2">
        <code class="mt-1.5 shrink-0 rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] text-indigo-700">{{${escapeHtml(v)}}}</code>
        <textarea data-varfill="${escapeHtml(v)}" rows="1"
          class="w-full rounded-md border border-gray-200 px-2 py-1 text-xs shadow-sm focus:border-indigo-400 focus:outline-none"
          placeholder="value…">${escapeHtml(variableValues[v] ?? "")}</textarea>
      </div>`).join("");
  panel.querySelectorAll("[data-varfill]").forEach(el => {
    el.addEventListener("input", () => { variableValues[el.dataset.varfill] = el.value; });
  });
}

export function resolvedPrompt(blocks) {
  return substituteVariables(assemblePrompt(blocks), variableValues);
}

export function getVariableValues() {
  return { ...variableValues };
}

export function setVariableValues(values) {
  Object.assign(variableValues, values);
}

// ── single run ──────────────────────────────────────────────────────
export function clearOutput() {
  document.getElementById("output-box").classList.add("hidden");
  document.getElementById("error-box").classList.add("hidden");
  document.getElementById("refine-bar").classList.add("hidden");
}

export function showError(msg) {
  const el = document.getElementById("error-box");
  el.textContent = msg;
  el.classList.remove("hidden");
}

export async function runSingle({ versionId } = {}) {
  const prompt = resolvedPrompt(state.blocks);
  const model = selectedModel();
  clearOutput();
  state.isStreaming = true;
  setRunLabel("Running…");

  const outputBox = document.getElementById("output-box");
  const outputText = document.getElementById("output-text");
  document.getElementById("output-model-badge").textContent = model.split("/").pop();
  outputBox.classList.remove("hidden");
  outputText.classList.add("streaming-cursor");
  try {
    const full = await streamRun({ prompt, model, version_id: versionId },
      (text) => renderMarkdown(outputText, text));
    state.lastOutput = full;
    renderRefineBar();
  } catch (err) {
    outputBox.classList.add("hidden");
    showError(err.message || "Something went wrong.");
  } finally {
    outputText.classList.remove("streaming-cursor");
    state.isStreaming = false;
    setRunLabel("Run");
    updatePreview();
  }
}

function setRunLabel(text) {
  document.getElementById("run-label").textContent = text;
}

// ── refine chips (Phase 3): one-tap edits with a visible diff ───────
const REFINE_CHIPS = [
  { label: "✂ shorter", block: "format", addition: "Keep it under 120 words." },
  { label: "🎩 more formal", block: "role", addition: "Formal, professional tone." },
  { label: "😊 friendlier", block: "role", addition: "Warm, conversational tone." },
  { label: "📋 tighter format", block: "format", addition: "Use short bullet points, no long paragraphs." },
  { label: "🧪 add an example", block: "examples", addition: "Input: <typical input>\nOutput: <ideal output>" },
];

function renderRefineBar() {
  const bar = document.getElementById("refine-bar");
  bar.classList.remove("hidden");
  bar.classList.add("flex");
  bar.innerHTML = `<span class="mr-1 self-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">Refine:</span>` +
    REFINE_CHIPS.map((chip, i) =>
      `<button data-refine="${i}" class="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">${chip.label}</button>`
    ).join("");
  bar.querySelectorAll("[data-refine]").forEach(btn => {
    btn.addEventListener("click", () => applyRefineChip(REFINE_CHIPS[btn.dataset.refine]));
  });
}

function applyRefineChip(chip) {
  // Show the exact diff this chip applies BEFORE running — the micro-lesson.
  const current = state.blocks[chip.block] || "";
  const next = current ? `${current}\n${chip.addition}` : chip.addition;
  const blockLabel = BLOCK_SPECS.find(s => s.key === chip.block).label;
  if (!confirm(`This edits your ${blockLabel} block:\n\n+ ${chip.addition}\n\nApply and re-run?`)) return;
  state.blocks[chip.block] = next;
  renderEditor("editor-a", state.blocks, { withAblate: true });
  updatePreview();
  toast(`${blockLabel} block updated — re-running`);
  runSingle();
}

// ── output download ─────────────────────────────────────────────────
export function downloadOutput() {
  const blob = new Blob([state.lastOutput], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "prompt-studio-output.md";
  a.click();
  URL.revokeObjectURL(a.href);
}
