"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Copy,
  Github,
  HelpCircle,
  Info,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  EMPTY_BLOCKS,
  TEMPLATES,
  type PromptBlocks,
  type Template,
  assemblePrompt,
  isPromptEmpty,
} from "@/lib/templates";

type Status = "idle" | "streaming" | "done" | "error";

const MODELS = [
  { value: "openai/gpt-4o-mini", label: "OpenAI · gpt-4o-mini (fast, cheap)" },
  { value: "openai/gpt-4o", label: "OpenAI · gpt-4o" },
  { value: "anthropic/claude-haiku-4-5", label: "Anthropic · Claude Haiku 4.5" },
  { value: "anthropic/claude-sonnet-4-5", label: "Anthropic · Claude Sonnet 4.5" },
  { value: "google/gemini-2.0-flash", label: "Google · Gemini 2.0 Flash" },
];

interface BlockSpec {
  key: keyof PromptBlocks;
  label: string;
  why: string;
  placeholder: string;
  multiline: boolean;
  rows?: number;
  optional?: boolean;
  chips?: readonly string[];
}

const BLOCKS: readonly BlockSpec[] = [
  {
    key: "role",
    label: "Role",
    why: "Tells the model who to be. Sets tone, vocabulary, and authority. The single highest-leverage line in most prompts.",
    placeholder: "e.g. A senior staff engineer who reviews code like Linus — direct, technical, kind but unsparing.",
    multiline: true,
    rows: 2,
    chips: [
      "Senior software engineer",
      "Friendly tutor",
      "Marketing copywriter",
      "Ruthless editor",
      "Climate scientist",
    ],
  },
  {
    key: "context",
    label: "Context",
    why: "Everything the model needs to know but can't infer: data, history, constraints, your situation. More context = more grounded answers.",
    placeholder: "e.g. Here's the code/document/situation:\n\n...",
    multiline: true,
    rows: 5,
  },
  {
    key: "task",
    label: "Task",
    why: "The actual ask. Be specific about what the model should produce — vague tasks get vague answers.",
    placeholder: "e.g. Review the code and find correctness bugs first, then style issues.",
    multiline: true,
    rows: 3,
  },
  {
    key: "format",
    label: "Format",
    why: "How the answer should be structured. Forces the model to be useful instead of rambling.",
    placeholder: "e.g. Markdown with three sections: ## Bugs, ## Suggested fix, ## Nits.",
    multiline: true,
    rows: 2,
    chips: ["Bullet list", "JSON", "Markdown table", "Single paragraph", "Code block"],
  },
  {
    key: "examples",
    label: "Examples",
    why: "Show, don't just tell. One or two before/after examples teaches the model what 'good' looks like in your domain.",
    placeholder: "e.g.\nInput: ...\nOutput: ...\n\nInput: ...\nOutput: ...",
    multiline: true,
    rows: 4,
    optional: true,
  },
] as const;

export default function HomePage(): React.ReactElement {
  const [blocks, setBlocks] = useState<PromptBlocks>(EMPTY_BLOCKS);
  const [model, setModel] = useState<string>(MODELS[0].value);
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const assembled = useMemo(() => assemblePrompt(blocks), [blocks]);
  const tokenEstimate = useMemo(() => Math.ceil(assembled.length / 4), [assembled]);

  function update(key: keyof PromptBlocks, value: string): void {
    setBlocks((prev) => ({ ...prev, [key]: value }));
  }

  function appendToBlock(key: keyof PromptBlocks, chip: string): void {
    setBlocks((prev) => {
      const current = prev[key];
      const next = current ? `${current}, ${chip.toLowerCase()}` : chip;
      return { ...prev, [key]: next };
    });
  }

  function loadTemplate(template: Template): void {
    setBlocks(template.blocks);
    setOutput("");
    setErrorMessage("");
    setStatus("idle");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function resetAll(): void {
    setBlocks(EMPTY_BLOCKS);
    setOutput("");
    setErrorMessage("");
    setStatus("idle");
  }

  async function copyAssembled(): Promise<void> {
    if (!assembled) return;
    await navigator.clipboard.writeText(assembled);
  }

  async function handleRun(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isPromptEmpty(blocks)) return;

    setOutput("");
    setErrorMessage("");
    setStatus("streaming");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: assembled, model }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorBody?.error ?? `Request failed (${response.status}).`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body to stream.");

      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setOutput(accumulated);
      }
      setStatus("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(msg);
      setStatus("error");
    }
  }

  const isStreaming = status === "streaming";

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-background">
        <Header />

        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="max-w-2xl">
              <Badge variant="primary" className="mb-4">
                The 5-block prompt framework
              </Badge>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Learn to write prompts that actually work.
              </h1>
              <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
                Fill in five blocks: <span className="text-foreground">Role</span>,{" "}
                <span className="text-foreground">Context</span>,{" "}
                <span className="text-foreground">Task</span>,{" "}
                <span className="text-foreground">Format</span>,{" "}
                <span className="text-foreground">Examples</span>. Watch the assembled
                prompt update live. Run it on a real LLM. See the difference structure
                makes.
              </p>
            </div>

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Start from a template
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template)}
                    className="group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="text-xl leading-none">{template.emoji}</span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {template.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {template.description}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <form onSubmit={handleRun} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Build your prompt
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetAll}
                  disabled={isPromptEmpty(blocks) && status === "idle"}
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </Button>
              </div>

              {BLOCKS.map((spec, index) => (
                <Block
                  key={spec.key}
                  index={index + 1}
                  spec={spec}
                  value={blocks[spec.key]}
                  onChange={(v) => update(spec.key, v)}
                  onChipClick={(chip) => appendToBlock(spec.key, chip)}
                />
              ))}
            </div>

            <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Assembled prompt
                </h2>
                <span className="text-xs text-muted-foreground">
                  ~{tokenEstimate} tokens
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="scroll-thin max-h-[420px] overflow-auto p-5">
                  {assembled ? (
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground">
                      {assembled}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Your assembled prompt will appear here as you fill in the blocks
                      on the left.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border bg-secondary/40 px-4 py-3">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="h-9 max-w-[55%] truncate rounded-md border border-border bg-card px-2 text-xs text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring outline-none"
                    aria-label="Model"
                  >
                    {MODELS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyAssembled}
                      disabled={!assembled}
                    >
                      <Copy className="size-3.5" />
                      Copy
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isPromptEmpty(blocks) || isStreaming}
                    >
                      {isStreaming ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Running…
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-3.5" />
                          Run
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              {output && (
                <div className="rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b border-border px-5 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Response
                    </p>
                    <Badge variant="outline">{model.split("/")[1]}</Badge>
                  </div>
                  <div className="scroll-thin max-h-[480px] overflow-auto p-5">
                    <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
                      {output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </form>
        </section>

        <Footer />
      </main>
    </TooltipProvider>
  );
}

function Header(): React.ReactElement {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Prompt Builder
          </span>
        </div>
        <Link
          href="https://github.com/dabhiram13/Prompt-Playground-Application"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Github className="size-3.5" />
          GitHub
        </Link>
      </div>
    </header>
  );
}

function Footer(): React.ReactElement {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
        <p>Built with Claude Code · MIT</p>
        <Link
          href="https://github.com/dabhiram13/Prompt-Playground-Application"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground"
        >
          github.com/dabhiram13/Prompt-Playground-Application
        </Link>
      </div>
    </footer>
  );
}

interface BlockProps {
  index: number;
  spec: BlockSpec;
  value: string;
  onChange: (value: string) => void;
  onChipClick: (chip: string) => void;
}

function Block({ index, spec, value, onChange, onChipClick }: BlockProps): React.ReactElement {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
          {index}
        </span>
        <Label htmlFor={spec.key} className="text-sm">
          {spec.label}
        </Label>
        {spec.optional && (
          <Badge variant="outline" className="text-[10px]">
            Optional
          </Badge>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="ml-auto inline-flex size-5 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={`Why ${spec.label} matters`}
            >
              <Info className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">{spec.why}</TooltipContent>
        </Tooltip>
      </div>

      <div className="mt-3">
        {spec.multiline ? (
          <Textarea
            id={spec.key}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={spec.placeholder}
            rows={spec.rows ?? 3}
          />
        ) : (
          <Input
            id={spec.key}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={spec.placeholder}
          />
        )}
      </div>

      {spec.chips && spec.chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {spec.chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChipClick(chip)}
              className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
            >
              + {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Suppress unused import warning (HelpCircle is reserved for future use)
void HelpCircle;
