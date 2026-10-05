// A/B comparison, one-click ablation, and the verdict card.

import { BLOCK_SPECS } from "./data.js";
import { state, assemblePrompt, renderMarkdown, escapeHtml, streamRun, toast } from "./core.js";
import { renderEditor, updatePreview, resolvedPrompt, selectedModel } from "./builder.js";

export function setCompareMode(on) {
  state.compareMode = on;
  document.getElementById("panel-b").classList.toggle("hidden", !on);
  document.getElementById("editor-a-label").classList.toggle("hidden", !on);
  document.getElementById("compare-strip").classList.toggle("hidden", !on);
  document.getElementById("preview-panel").classList.toggle("hidden", on);
  document.getElementById("compare-toggle").classList.toggle("bg-indigo-50", on);
  document.getElementById("compare-toggle").classList.toggle("text-indigo-700", on);
  if (on) {
    renderEditor("editor-b", state.blocksB, {});
  }
  updatePreview();
}

export function copyAtoB() {
  state.blocksB = { ...state.blocks };
  renderEditor("editor-b", state.blocksB, {});
  updatePreview();
  toast("Variant B now matches A — change something and run both");
}

// One-click ablation: B = A minus one block, then run the comparison.
export function ablate(blockKey) {
  const label = BLOCK_SPECS.find(s => s.key === blockKey).label;
  if (!(state.blocks[blockKey] || "").trim()) {
    toast(`Your ${label} block is empty — fill it in first.`);
    return;
  }
  state.blocksB = { ...state.blocks, [blockKey]: "" };
  setCompareMode(true);
  toast(`Variant B = your prompt WITHOUT the ${label} block. Running both…`);
  runBoth();
}

export async function runBoth() {
  const promptA = resolvedPrompt(state.blocks);
  const promptB = resolvedPrompt(state.blocksB);
  if (promptA.length < 10 || promptB.length < 10) {
    toast("Both variants need content (10+ chars). Use ⧉ copy from A, then edit B.");
    return;
  }
  const modelA = selectedModel();
  const modelB = document.getElementById("model-select-b").value;
  const btn = document.getElementById("run-both-btn");
  btn.disabled = true;
  btn.textContent = "Running…";

  document.getElementById("badge-a").textContent = modelA.split("/").pop();
  document.getElementById("badge-b").textContent = modelB.split("/").pop();
  const outA = document.getElementById("output-a");
  const outB = document.getElementById("output-b");
  outA.textContent = "…"; outB.textContent = "…";
  document.getElementById("verdict-card").classList.add("hidden");

  const results = await Promise.allSettled([
    streamRun({ prompt: promptA, model: modelA }, t => renderMarkdown(outA, t)),
    streamRun({ prompt: promptB, model: modelB }, t => renderMarkdown(outB, t)),
  ]);
  btn.disabled = false;
  btn.textContent = "▶▶ Run both";

  const [resA, resB] = results;
  if (resA.status === "rejected") renderMarkdown(outA, `**Error:** ${resA.reason.message}`);
  if (resB.status === "rejected") renderMarkdown(outB, `**Error:** ${resB.reason.message}`);
  if (resA.status === "fulfilled" && resB.status === "fulfilled") {
    requestVerdict(promptA, promptB, resA.value, resB.value);
  }
}

// Verdict card — rendered only AFTER both raw outputs are complete,
// clearly labeled as an AI opinion with the rubric expandable.
async function requestVerdict(promptA, promptB, outputA, outputB) {
  const card = document.getElementById("verdict-card");
  card.classList.remove("hidden");
  card.innerHTML = `<div class="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-400 shadow-sm">⚖ Asking a judge model to compare… (free model, may take a few seconds)</div>`;
  try {
    const resp = await fetch("/api/verdict", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt_a: promptA, prompt_b: promptB, output_a: outputA, output_b: outputB }),
    });
    const verdict = await resp.json();
    if (!resp.ok) throw new Error(verdict?.error ?? "Verdict failed");
    renderVerdict(card, verdict);
  } catch (err) {
    card.innerHTML = `<div class="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-sm">Couldn't get a verdict (${escapeHtml(err.message)}) — judge for yourself above. That works too.</div>`;
  }
}

function renderVerdict(card, v) {
  const winnerText = v.winner === "tie" ? "It's a tie" : `Variant ${v.winner} wins`;
  const winnerColor = v.winner === "A" ? "indigo" : v.winner === "B" ? "amber" : "gray";
  const scoreRow = (variant) => {
    const s = v.scores?.[variant] ?? {};
    return `<tr><td class="py-1 pr-4 font-medium">Variant ${variant}</td>
      <td class="px-3 text-center">${s.format ?? "–"}</td>
      <td class="px-3 text-center">${s.specificity ?? "–"}</td>
      <td class="px-3 text-center">${s.usefulness ?? "–"}</td></tr>`;
  };
  card.innerHTML = `
    <div class="rounded-xl border border-${winnerColor}-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-3">
        <span class="text-base font-semibold">⚖ ${winnerText}</span>
        <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">AI opinion — judge for yourself</span>
        <span class="ml-auto text-[10px] text-gray-400">judge: ${escapeHtml(v.judge_model ?? "?")}</span>
      </div>
      <div class="px-5 py-4 space-y-3 text-sm text-gray-700">
        <p>${escapeHtml(v.rationale ?? "")}</p>
        ${v.prompt_insight ? `<p class="rounded-md bg-indigo-50 px-3 py-2 text-indigo-800">💡 ${escapeHtml(v.prompt_insight)}</p>` : ""}
        <details class="text-xs text-gray-500">
          <summary class="cursor-pointer font-medium">Scores by criterion (1-5)</summary>
          <table class="mt-2"><thead><tr><th></th><th class="px-3 font-medium">Format</th><th class="px-3 font-medium">Specificity</th><th class="px-3 font-medium">Usefulness</th></tr></thead>
          <tbody>${scoreRow("A")}${scoreRow("B")}</tbody></table>
        </details>
      </div>
    </div>`;
}
