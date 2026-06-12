// Entry point: view routing, toolbar wiring, remix handoff.

import { state, emptyBlocks, assemblePrompt, toast } from "./core.js";
import {
  renderEditor, renderTemplates, updatePreview, clearOutput,
  runSingle, downloadOutput, loadBlocks, setVariableValues,
  restoreDraft, clearDraft,
} from "./builder.js";
import { setCompareMode, copyAtoB, ablate, runBoth } from "./compare.js";
import { renderGallery } from "./gallery.js";
import { savePrompt, renderLibrary, myAppsModal } from "./library.js";

// ── view routing ────────────────────────────────────────────────────
const VIEWS = ["build", "gallery", "library"];

function showView(name) {
  VIEWS.forEach(v => document.getElementById(`view-${v}`).classList.toggle("hidden", v !== name));
  document.querySelectorAll(".nav-tab").forEach(tab => {
    const active = tab.dataset.view === name;
    tab.classList.toggle("bg-indigo-50", active);
    tab.classList.toggle("text-indigo-700", active);
    tab.classList.toggle("text-gray-500", !active);
  });
  if (name === "gallery") renderGallery();
  if (name === "library") renderLibrary();
}

document.querySelectorAll(".nav-tab").forEach(tab =>
  tab.addEventListener("click", () => showView(tab.dataset.view)));

// ── toolbar ─────────────────────────────────────────────────────────
document.getElementById("compare-toggle").addEventListener("click", () =>
  setCompareMode(!state.compareMode));
document.getElementById("copy-a-to-b").addEventListener("click", copyAtoB);
document.getElementById("run-both-btn").addEventListener("click", runBoth);
document.getElementById("save-btn").addEventListener("click", savePrompt);
document.getElementById("myapps-btn").addEventListener("click", myAppsModal);

document.getElementById("reset-btn").addEventListener("click", () => {
  clearDraft();
  state.blocks = emptyBlocks();
  state.blocksB = emptyBlocks();
  state.currentPromptId = null;
  state.currentPromptTitle = null;
  document.getElementById("builder-title").textContent = "Build your prompt";
  renderEditor("editor-a", state.blocks, { withAblate: true });
  if (state.compareMode) renderEditor("editor-b", state.blocksB, {});
  updatePreview();
  clearOutput();
});

document.getElementById("run-btn").addEventListener("click", (e) => {
  e.preventDefault();
  if (assemblePrompt(state.blocks) && !state.isStreaming) runSingle();
});

document.getElementById("model-select").addEventListener("change", updatePreview);
document.getElementById("copy-btn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(assemblePrompt(state.blocks));
  toast("Prompt copied");
});
document.getElementById("download-btn").addEventListener("click", downloadOutput);

// Ablation buttons are rendered inside the block editor; delegate clicks.
document.getElementById("editor-a").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-ablate]");
  if (btn) ablate(btn.dataset.ablate);
});

// ── remix handoff (?remix=<slug>) ───────────────────────────────────
async function maybeRemix() {
  const slug = new URLSearchParams(location.search).get("remix");
  if (!slug) return false;
  try {
    const resp = await fetch(`/api/remix/${slug}`);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error ?? "Remix failed");
    loadBlocks(data.blocks, null, null);
    history.replaceState(null, "", "/");
    toast(`Remixed "${data.title}" — it's yours now. Tweak it, prove it, publish your own.`);
    return true;
  } catch (err) {
    toast(err.message);
    return false;
  }
}

// ── init ────────────────────────────────────────────────────────────
renderTemplates();
const hasRemix = new URLSearchParams(location.search).has("remix");
if (!hasRemix && restoreDraft()) toast("Restored your unsaved draft");
renderEditor("editor-a", state.blocks, { withAblate: true });
updatePreview();
showView("build");
maybeRemix();
