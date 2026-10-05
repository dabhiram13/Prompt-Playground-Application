// Library view: prompts, versions, diffs, test inputs, checklists,
// grading scorecards, publishing, and export-to-code.

import {
  state, api, assemblePrompt, substituteVariables, estimateTokens,
  escapeHtml, streamRun, showModal, closeModal, toast,
} from "./core.js";
import { loadBlocks, selectedModel, getVariableValues } from "./builder.js";

let currentDetail = null;   // {prompt, versions, test_inputs, checklist}

// ── save from the builder ───────────────────────────────────────────
export async function savePrompt() {
  const blocks = state.blocks;
  if (!assemblePrompt(blocks)) { toast("Nothing to save yet."); return; }

  if (state.currentPromptId) {
    try {
      const res = await api(`/api/prompts/${state.currentPromptId}/versions`, {
        method: "POST", body: JSON.stringify({ blocks, model: selectedModel() }),
      });
      toast("Saved as a new version ✓");
      return res.version_id;
    } catch (err) { toast(err.message); return; }
  }

  const title = prompt("Name this prompt (e.g. 'Cover letter generator'):");
  if (!title) return;
  try {
    const res = await api("/api/prompts", {
      method: "POST", body: JSON.stringify({ title, blocks, model: selectedModel() }),
    });
    state.currentPromptId = res.id;
    state.currentPromptTitle = title;
    document.getElementById("builder-title").textContent = `Editing: ${title}`;
    toast(`Saved "${title}" ✓ — find it in Library`);
  } catch (err) { toast(err.message); }
}

// ── library list ────────────────────────────────────────────────────
export async function renderLibrary() {
  const list = document.getElementById("library-list");
  document.getElementById("library-detail").innerHTML = "";
  try {
    const { prompts } = await api("/api/prompts");
    if (!prompts.length) {
      list.innerHTML = `<p class="col-span-full rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        No saved prompts yet. Build one, then hit 💾 Save.</p>`;
      return;
    }
    list.innerHTML = "";
    prompts.forEach(p => {
      const card = document.createElement("button");
      card.className = "rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:border-indigo-300 hover:shadow-md transition-all";
      card.innerHTML = `
        <p class="text-sm font-semibold text-gray-800">${escapeHtml(p.title)}</p>
        <p class="mt-1 text-xs text-gray-400">v${p.latest_version} · ${p.run_count} runs · updated ${escapeHtml(p.updated_at)}</p>`;
      card.addEventListener("click", () => openDetail(p.id));
      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = `<p class="text-sm text-red-600">${escapeHtml(err.message)}</p>`;
  }
}

// ── detail: versions, diff, test inputs, checklist, scorecard ───────
async function openDetail(promptId) {
  currentDetail = await api(`/api/prompts/${promptId}`);
  const { prompt: p, versions, test_inputs, checklist } = currentDetail;
  const latest = versions[0];
  const el = document.getElementById("library-detail");
  el.innerHTML = `
    <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-center gap-2 border-b border-gray-100 px-6 py-4">
        <h2 class="text-lg font-semibold">${escapeHtml(p.title)}</h2>
        <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">${versions.length} version${versions.length > 1 ? "s" : ""}</span>
        <div class="ml-auto flex flex-wrap gap-2">
          <button id="d-edit" class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">✏ Open in builder</button>
          <button id="d-publish" class="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">🚀 Publish</button>
          <button id="d-export" class="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">⤓ Export code</button>
          <button id="d-delete" class="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>
      <div class="grid gap-6 px-6 py-5 lg:grid-cols-2">
        <div class="space-y-5">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Versions</h3>
            <div id="d-versions" class="mt-2 space-y-2"></div>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Test inputs ${latest.variables.length ? `(for {{${latest.variables.join("}}, {{")}}})` : ""}</h3>
              <button id="d-add-input" class="text-xs text-indigo-600 hover:underline">+ add</button>
            </div>
            <div id="d-inputs" class="mt-2 space-y-1.5"></div>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Quality checklist</h3>
              <button id="d-edit-checklist" class="text-xs text-indigo-600 hover:underline">edit</button>
            </div>
            <div id="d-checklist" class="mt-2"></div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Prove it: run & grade</h3>
            <span id="d-cost" class="text-[10px] text-gray-400"></span>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button id="d-run-grade" class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40">▶ Run latest vs all test inputs + grade</button>
          </div>
          <div id="d-scorecard" class="mt-4"></div>
        </div>
      </div>
    </div>`;

  renderVersions(versions);
  renderInputs(test_inputs, latest.variables);
  renderChecklist(checklist);
  updateCostEstimate();

  document.getElementById("d-edit").addEventListener("click", () =>
    loadBlocks(latest.blocks, p.id, p.title));
  document.getElementById("d-delete").addEventListener("click", async () => {
    if (!confirm(`Delete "${p.title}" and all its versions/runs?`)) return;
    await api(`/api/prompts/${p.id}`, { method: "DELETE" });
    toast("Deleted");
    renderLibrary();
  });
  document.getElementById("d-add-input").addEventListener("click", () => addInputModal(latest.variables));
  document.getElementById("d-edit-checklist").addEventListener("click", () => checklistModal());
  document.getElementById("d-run-grade").addEventListener("click", runAndGrade);
  document.getElementById("d-publish").addEventListener("click", () => publishModal(latest));
  document.getElementById("d-export").addEventListener("click", () => exportModal(latest));
}

function renderVersions(versions) {
  const el = document.getElementById("d-versions");
  el.innerHTML = "";
  versions.forEach((v, idx) => {
    const row = document.createElement("div");
    row.className = "flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs";
    row.innerHTML = `
      <span class="font-semibold text-gray-700">v${v.version_num}</span>
      <span class="text-gray-400">${escapeHtml(v.model.split("/").pop())} · ${escapeHtml(v.created_at)}</span>
      <div class="ml-auto flex gap-2">
        ${idx < versions.length - 1 ? `<button data-diff="${idx}" class="text-indigo-600 hover:underline">diff vs v${versions[idx + 1].version_num}</button>` : ""}
        <button data-load="${idx}" class="text-gray-500 hover:underline">open</button>
      </div>`;
    el.appendChild(row);
  });
  el.querySelectorAll("[data-diff]").forEach(btn =>
    btn.addEventListener("click", () => diffModal(versions[+btn.dataset.diff], versions[+btn.dataset.diff + 1])));
  el.querySelectorAll("[data-load]").forEach(btn =>
    btn.addEventListener("click", () => {
      const v = versions[+btn.dataset.load];
      loadBlocks(v.blocks, currentDetail.prompt.id, currentDetail.prompt.title);
    }));
}

// Plain-English block diff: which blocks changed, old vs new side by side.
function diffModal(newer, older) {
  const labels = { role: "Role", context: "Context", task: "Task", format: "Format", examples: "Examples" };
  let rows = "";
  for (const key of Object.keys(labels)) {
    const a = (older.blocks[key] || "").trim();
    const b = (newer.blocks[key] || "").trim();
    if (a === b) continue;
    rows += `
      <div class="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
        <p class="text-xs font-semibold text-amber-700">${labels[key]} block changed</p>
        <div class="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
          <div><p class="text-gray-400 mb-1">v${older.version_num}</p><pre class="whitespace-pre-wrap rounded bg-white p-2 text-gray-500 line-through decoration-red-300">${escapeHtml(a) || "<em>(empty)</em>"}</pre></div>
          <div><p class="text-gray-400 mb-1">v${newer.version_num}</p><pre class="whitespace-pre-wrap rounded bg-white p-2 text-gray-800">${escapeHtml(b) || "<em>(empty)</em>"}</pre></div>
        </div>
      </div>`;
  }
  if (newer.model !== older.model) {
    rows += `<p class="text-xs text-gray-600">Model changed: <code>${escapeHtml(older.model)}</code> → <code>${escapeHtml(newer.model)}</code></p>`;
  }
  showModal(`
    <h3 class="text-base font-semibold">v${older.version_num} → v${newer.version_num}: what changed</h3>
    <div class="mt-4 space-y-3">${rows || '<p class="text-sm text-gray-500">No block changes (model/params only).</p>'}</div>
    <button class="mt-5 rounded-md border border-gray-200 px-3 py-1.5 text-xs" onclick="document.getElementById('modal-root').innerHTML=''">Close</button>`);
}

// ── test inputs ─────────────────────────────────────────────────────
function renderInputs(inputs, variables) {
  const el = document.getElementById("d-inputs");
  if (!inputs.length) {
    el.innerHTML = `<p class="text-xs text-gray-400">None yet. Test inputs are saved fill-ins for your {{variables}} — add 2-3 real ones (e.g. real job postings) so you can prove a version works on all of them.</p>`;
    return;
  }
  el.innerHTML = "";
  inputs.forEach(t => {
    const row = document.createElement("div");
    row.className = "flex items-center gap-2 rounded-md border border-gray-100 px-3 py-1.5 text-xs";
    row.innerHTML = `<span class="font-medium text-gray-700">${escapeHtml(t.name)}</span>
      <span class="truncate text-gray-400">${escapeHtml(Object.values(t.values).join(" · ").slice(0, 60))}</span>
      <button data-del="${t.id}" class="ml-auto text-red-500 hover:underline">remove</button>`;
    el.appendChild(row);
  });
  el.querySelectorAll("[data-del]").forEach(btn =>
    btn.addEventListener("click", async () => {
      await api(`/api/prompts/${currentDetail.prompt.id}/test-inputs/${btn.dataset.del}`, { method: "DELETE" });
      openDetail(currentDetail.prompt.id);
    }));
}

function addInputModal(variables) {
  const fields = variables.length
    ? variables.map(v => `
        <label class="block text-xs font-medium text-gray-600 mt-3">{{${escapeHtml(v)}}}</label>
        <textarea data-ti="${escapeHtml(v)}" rows="3" class="mt-1 w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs"></textarea>`).join("")
    : `<p class="mt-3 text-xs text-gray-500">This prompt has no {{variables}} yet — a test input will just re-run it as-is. Tip: put the changing part of your Context in {{curly_braces}}.</p>`;
  showModal(`
    <h3 class="text-base font-semibold">Add a test input</h3>
    <p class="mt-1 text-xs text-gray-500">A real example you'll test every version against — e.g. an actual job posting.</p>
    <label class="block text-xs font-medium text-gray-600 mt-4">Name</label>
    <input id="ti-name" class="mt-1 w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs" placeholder="e.g. Stripe PM posting" />
    ${fields}
    <div class="mt-5 flex gap-2">
      <button id="ti-save" class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">Save</button>
      <button class="rounded-md border border-gray-200 px-3 py-1.5 text-xs" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
    </div>`);
  document.getElementById("ti-save").addEventListener("click", async () => {
    const name = document.getElementById("ti-name").value.trim();
    const values = {};
    document.querySelectorAll("[data-ti]").forEach(el => values[el.dataset.ti] = el.value);
    if (!name) { toast("Name it first"); return; }
    await api(`/api/prompts/${currentDetail.prompt.id}/test-inputs`, {
      method: "POST", body: JSON.stringify({ name, values }),
    });
    closeModal();
    openDetail(currentDetail.prompt.id);
  });
}

// ── checklist ───────────────────────────────────────────────────────
const CHECK_TYPE_LABELS = {
  max_words: "Max words", min_words: "Min words",
  contains: "Must contain", not_contains: "Must NOT contain", judge: "AI judge (yes/no)",
};

function renderChecklist(checklist) {
  const el = document.getElementById("d-checklist");
  const items = checklist?.items ?? [];
  if (!items.length) {
    el.innerHTML = `<p class="text-xs text-gray-400">No checks yet. A checklist turns "looks good to me" into "passes 4/4 checks" — click edit to add some.</p>`;
    return;
  }
  el.innerHTML = items.map(item => `
    <div class="flex items-center gap-2 rounded-md border border-gray-100 px-3 py-1.5 text-xs">
      <span class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">${CHECK_TYPE_LABELS[item.type]}</span>
      <span class="text-gray-700">${escapeHtml(item.label)}</span>
      ${item.value ? `<code class="text-gray-400">${escapeHtml(String(item.value))}</code>` : ""}
    </div>`).join("");
}

function checklistModal() {
  const items = currentDetail.checklist?.items ?? [];
  const row = (item = { type: "contains", label: "", value: "" }) => `
    <div class="cl-row flex flex-wrap items-center gap-2 rounded-md border border-gray-100 p-2">
      <select class="cl-type rounded border border-gray-200 px-1.5 py-1 text-xs">
        ${Object.entries(CHECK_TYPE_LABELS).map(([k, v]) =>
          `<option value="${k}" ${item.type === k ? "selected" : ""}>${v}</option>`).join("")}
      </select>
      <input class="cl-label w-44 rounded border border-gray-200 px-2 py-1 text-xs" placeholder="what to check (plain English)" value="${escapeHtml(item.label)}" />
      <input class="cl-value w-32 rounded border border-gray-200 px-2 py-1 text-xs" placeholder="value (words/text)" value="${escapeHtml(String(item.value ?? ""))}" />
      <button class="cl-del text-xs text-red-500">✕</button>
    </div>`;
  showModal(`
    <h3 class="text-base font-semibold">Quality checklist</h3>
    <p class="mt-1 text-xs text-gray-500">Pass/fail checks graded against every run. 'AI judge' checks use a free model; word/contains checks are exact. Red cells always show <em>why</em>, and you can override any verdict you disagree with.</p>
    <div id="cl-rows" class="mt-4 space-y-2">${items.map(row).join("")}</div>
    <button id="cl-add" class="mt-2 text-xs text-indigo-600 hover:underline">+ add check</button>
    <div class="mt-5 flex gap-2">
      <button id="cl-save" class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">Save checklist</button>
      <button class="rounded-md border border-gray-200 px-3 py-1.5 text-xs" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
    </div>`);
  const rows = document.getElementById("cl-rows");
  const wireDeletes = () => rows.querySelectorAll(".cl-del").forEach(b =>
    b.onclick = () => b.closest(".cl-row").remove());
  wireDeletes();
  document.getElementById("cl-add").addEventListener("click", () => {
    rows.insertAdjacentHTML("beforeend", row());
    wireDeletes();
  });
  document.getElementById("cl-save").addEventListener("click", async () => {
    const items = [...rows.querySelectorAll(".cl-row")].map(r => ({
      type: r.querySelector(".cl-type").value,
      label: r.querySelector(".cl-label").value.trim(),
      value: r.querySelector(".cl-value").value.trim(),
    })).filter(i => i.label);
    try {
      await api(`/api/prompts/${currentDetail.prompt.id}/checklist`, {
        method: "PUT", body: JSON.stringify({ items }),
      });
      closeModal();
      openDetail(currentDetail.prompt.id);
    } catch (err) { toast(err.message); }
  });
}

// ── run latest version against all test inputs, then grade ─────────
function updateCostEstimate() {
  const latest = currentDetail.versions[0];
  const n = Math.max(currentDetail.test_inputs.length, 1);
  const tokens = estimateTokens(assemblePrompt(latest.blocks)) * n;
  const free = latest.model.endsWith(":free") || latest.model.startsWith("ollama/");
  document.getElementById("d-cost").textContent =
    `${n} run${n > 1 ? "s" : ""} · ~${tokens}+ tokens · ${free ? "$0.00 (free model)" : "PAID model"}`;
}

async function runAndGrade() {
  const { versions, test_inputs, checklist, prompt: p } = currentDetail;
  const latest = versions[0];
  const inputs = test_inputs.length ? test_inputs : [{ id: null, name: "(no test input)", values: {} }];
  const hasChecklist = (checklist?.items ?? []).length > 0;
  const free = latest.model.endsWith(":free") || latest.model.startsWith("ollama/");
  const judgeCalls = hasChecklist ? (checklist.items.filter(i => i.type === "judge").length * inputs.length) : 0;

  if (!confirm(
    `This will make ${inputs.length} model call${inputs.length > 1 ? "s" : ""}` +
    (judgeCalls ? ` + ${judgeCalls} judge call${judgeCalls > 1 ? "s" : ""}` : "") +
    ` on ${latest.model}.\nCost: ${free ? "$0.00 — free model" : "PAID model — this costs real money"}.\n\nProceed?`)) return;

  const btn = document.getElementById("d-run-grade");
  btn.disabled = true;
  const scorecard = document.getElementById("d-scorecard");
  scorecard.innerHTML = `<p class="text-xs text-gray-400">Running v${latest.version_num} against ${inputs.length} input(s)…</p>`;
  const results = [];

  for (const ti of inputs) {
    const promptText = substituteVariables(assemblePrompt(latest.blocks), ti.values);
    let output = "", error = null, runId = null;
    try {
      output = await streamRun(
        { prompt: promptText, model: latest.model, version_id: latest.id, test_input_id: ti.id },
        () => {});
      // grade the freshly recorded run (most recent for this version)
      if (hasChecklist) {
        const { runs } = await api(`/api/versions/${latest.id}/runs`);
        runId = runs[0]?.id;
        if (runId) {
          const graded = await api("/api/grade", {
            method: "POST", body: JSON.stringify({ run_id: runId }),
          });
          results.push({ name: ti.name, output, grades: graded.grades, runId });
          renderScorecard(results, latest, versions);
          continue;
        }
      }
    } catch (err) { error = err.message; }
    results.push({ name: ti.name, output, error, grades: null, runId });
    renderScorecard(results, latest, versions);
  }
  btn.disabled = false;
}

function renderScorecard(results, version, versions) {
  const el = document.getElementById("d-scorecard");
  const cells = results.map((r, ri) => {
    if (r.error) return `<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">${escapeHtml(r.name)}: ${escapeHtml(r.error)}</div>`;
    if (!r.grades) return `
      <details class="rounded-lg border border-gray-200 p-3 text-xs">
        <summary class="cursor-pointer font-medium">${escapeHtml(r.name)} — ran ✓ (no checklist to grade)</summary>
        <pre class="mt-2 whitespace-pre-wrap text-gray-600">${escapeHtml(r.output.slice(0, 1500))}</pre>
      </details>`;
    const chips = r.grades.results.map((c, ci) => `
      <button data-run="${r.runId}" data-ci="${ci}" data-pass="${c.pass}" title="${escapeHtml(c.reason)} — click to override"
        class="grade-chip rounded-full px-2 py-0.5 text-[10px] font-medium ${c.pass ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}">
        ${c.pass ? "✓" : "✗"} ${escapeHtml(c.label)}${c.overridden ? " (you)" : ""}</button>`).join(" ");
    return `
      <div class="rounded-lg border border-gray-200 p-3 text-xs space-y-2">
        <div class="flex items-center gap-2">
          <span class="font-medium">${escapeHtml(r.name)}</span>
          <span class="ml-auto font-semibold ${r.grades.passed === r.grades.total ? "text-emerald-600" : "text-amber-600"}">${r.grades.passed}/${r.grades.total}</span>
        </div>
        <div class="flex flex-wrap gap-1">${chips}</div>
        <details><summary class="cursor-pointer text-gray-400">see output</summary>
          <pre class="mt-1 whitespace-pre-wrap text-gray-600">${escapeHtml(r.output.slice(0, 1500))}</pre></details>
      </div>`;
  }).join("");

  const graded = results.filter(r => r.grades);
  const totalPassed = graded.reduce((s, r) => s + r.grades.passed, 0);
  const totalChecks = graded.reduce((s, r) => s + r.grades.total, 0);
  el.innerHTML = `
    ${totalChecks ? `<p class="mb-2 text-sm font-semibold">v${version.version_num} scorecard: <span class="${totalPassed === totalChecks ? "text-emerald-600" : "text-amber-600"}">${totalPassed}/${totalChecks} checks passed</span> <span class="ml-1 text-[10px] font-normal text-gray-400">disagree with a chip? click it to flip it</span></p>` : ""}
    <div class="space-y-2">${cells}</div>
    ${versions.length > 1 ? `<p class="mt-3 text-xs text-gray-400">Regression check: run this on an older version (open it from Versions, save no changes, run) and compare scorecards.</p>` : ""}`;
  el.querySelectorAll(".grade-chip").forEach(chip => {
    chip.addEventListener("click", async () => {
      const flipped = chip.dataset.pass !== "true";
      await api("/api/grade/override", {
        method: "POST",
        body: JSON.stringify({ run_id: +chip.dataset.run, index: +chip.dataset.ci, pass: flipped }),
      });
      chip.dataset.pass = String(flipped);
      chip.className = `grade-chip rounded-full px-2 py-0.5 text-[10px] font-medium ${flipped ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`;
      chip.textContent = `${flipped ? "✓" : "✗"} ${chip.textContent.slice(2).replace(" (you)", "")} (you)`;
      toast("Overridden — your call beats the judge's");
    });
  });
}

// ── publish ─────────────────────────────────────────────────────────
function publishModal(version) {
  const p = currentDetail.prompt;
  showModal(`
    <h3 class="text-base font-semibold">🚀 Publish v${version.version_num} as a mini-app</h3>
    <p class="mt-1 text-xs text-gray-500">Anyone with the link can run it — no account, no API key, on free models. Rate limits and daily budgets protect you automatically.</p>
    <label class="mt-4 block text-xs font-medium text-gray-600">Title</label>
    <input id="pub-title" class="mt-1 w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm" value="${escapeHtml(p.title)}" />
    <label class="mt-3 block text-xs font-medium text-gray-600">Description (optional)</label>
    <input id="pub-desc" class="mt-1 w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm" placeholder="What does it do, for whom?" />
    <label class="mt-3 flex items-center gap-2 text-xs text-gray-600">
      <input type="checkbox" id="pub-show" checked /> Show visitors how it's built (the prompt) — great for teaching, powers Remix
    </label>
    <div class="mt-5 flex gap-2">
      <button id="pub-go" class="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white">Publish</button>
      <button class="rounded-md border border-gray-200 px-3 py-1.5 text-xs" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button>
    </div>
    <div id="pub-result" class="mt-3"></div>`);
  document.getElementById("pub-go").addEventListener("click", async () => {
    try {
      const res = await api("/api/publish", {
        method: "POST",
        body: JSON.stringify({
          version_id: version.id,
          title: document.getElementById("pub-title").value.trim(),
          description: document.getElementById("pub-desc").value.trim(),
          show_prompt: document.getElementById("pub-show").checked,
        }),
      });
      const url = `${location.origin}${res.url}`;
      document.getElementById("pub-result").innerHTML = `
        <div class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs">
          <p class="font-medium text-emerald-700">Live! Share this link:</p>
          <a href="${res.url}" target="_blank" class="mt-1 block break-all text-indigo-600 hover:underline">${url}</a>
        </div>`;
    } catch (err) { toast(err.message); }
  });
}

export async function myAppsModal() {
  let apps;
  try { ({ apps } = await api("/api/my-apps")); } catch (err) { toast(err.message); return; }
  showModal(`
    <h3 class="text-base font-semibold">My published apps</h3>
    <div class="mt-4 space-y-2">${apps.length ? apps.map(a => `
      <div class="flex flex-wrap items-center gap-2 rounded-md border border-gray-100 p-3 text-xs">
        <a href="/t/${a.slug}" target="_blank" class="font-medium text-indigo-600 hover:underline">${escapeHtml(a.title)}</a>
        <span class="text-gray-400">${a.run_count} runs · ~${a.tokens_today} tokens today</span>
        <label class="ml-auto flex items-center gap-1.5 text-gray-600">
          <input type="checkbox" data-toggle="${a.slug}" ${a.published ? "checked" : ""}/> live
        </label>
      </div>`).join("") : '<p class="text-sm text-gray-500">Nothing published yet. Open a prompt and hit 🚀 Publish.</p>'}</div>
    <button class="mt-5 rounded-md border border-gray-200 px-3 py-1.5 text-xs" onclick="document.getElementById('modal-root').innerHTML=''">Close</button>`);
  document.querySelectorAll("[data-toggle]").forEach(cb =>
    cb.addEventListener("change", async () => {
      await api(`/api/my-apps/${cb.dataset.toggle}/toggle`, {
        method: "POST", body: JSON.stringify({ published: cb.checked }),
      });
      toast(cb.checked ? "App is live" : "App unpublished");
    }));
}

// ── export to code ──────────────────────────────────────────────────
function exportModal(version) {
  const assembled = assemblePrompt(version.blocks);
  const vars = currentDetail.versions[0].variables;
  const argList = vars.map(v => v.replace(/[ -]/g, "_")).join(", ");
  const pyBody = vars.reduce((acc, v) =>
    acc.replaceAll(`{{${v}}}`, `{${v.replace(/[ -]/g, "_")}}`), assembled);
  const python = `import os\nfrom openai import OpenAI\n\n# Free key: https://openrouter.ai/keys — this model costs $0\nclient = OpenAI(base_url="https://openrouter.ai/api/v1",\n                api_key=os.environ["OPENROUTER_API_KEY"])\n\ndef run(${argList}):\n    prompt = f"""${pyBody.replaceAll('"""', '\\"\\"\\"')}"""\n    resp = client.chat.completions.create(\n        model="${version.model}",\n        messages=[{"role": "user", "content": prompt}])\n    return resp.choices[0].message.content\n`;
  const jsBody = vars.reduce((acc, v) =>
    acc.replaceAll(`{{${v}}}`, `\${${v.replace(/[ -]/g, "_")}}`), assembled);
  const js = `// Free key: https://openrouter.ai/keys — this model costs $0\nexport async function run(${argList}) {\n  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {\n    method: "POST",\n    headers: {\n      "Authorization": \`Bearer \${process.env.OPENROUTER_API_KEY}\`,\n      "Content-Type": "application/json",\n    },\n    body: JSON.stringify({\n      model: "${version.model}",\n      messages: [{ role: "user", content: \`${jsBody.replaceAll("`", "\\`")}\` }],\n    }),\n  });\n  const data = await resp.json();\n  return data.choices[0].message.content;\n}\n`;
  showModal(`
    <h3 class="text-base font-semibold">⤓ Your prompt as code</h3>
    <p class="mt-1 text-xs text-gray-500">v${version.version_num}, with your {{variables}} as function arguments. Copy, paste, ship.</p>
    <div class="mt-4 flex gap-2 text-xs">
      <button id="ex-py" class="ex-tab rounded-md bg-indigo-600 px-3 py-1 font-medium text-white">Python</button>
      <button id="ex-js" class="ex-tab rounded-md border border-gray-200 px-3 py-1">JavaScript</button>
      <button id="ex-copy" class="ml-auto rounded-md border border-gray-200 px-3 py-1">Copy</button>
    </div>
    <pre id="ex-code" class="scroll-thin mt-3 max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 text-[11px] leading-relaxed text-gray-100"></pre>
    <button class="mt-4 rounded-md border border-gray-200 px-3 py-1.5 text-xs" onclick="document.getElementById('modal-root').innerHTML=''">Close</button>`);
  const codeEl = document.getElementById("ex-code");
  let current = python;
  const show = (code, active) => {
    current = code; codeEl.textContent = code;
    document.getElementById("ex-py").className = `ex-tab rounded-md px-3 py-1 ${active === "py" ? "bg-indigo-600 font-medium text-white" : "border border-gray-200"}`;
    document.getElementById("ex-js").className = `ex-tab rounded-md px-3 py-1 ${active === "js" ? "bg-indigo-600 font-medium text-white" : "border border-gray-200"}`;
  };
  show(python, "py");
  document.getElementById("ex-py").addEventListener("click", () => show(python, "py"));
  document.getElementById("ex-js").addEventListener("click", () => show(js, "js"));
  document.getElementById("ex-copy").addEventListener("click", async () => {
    await navigator.clipboard.writeText(current);
    toast("Copied");
  });
}
