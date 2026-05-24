export interface PromptBlocks {
  role: string;
  context: string;
  task: string;
  format: string;
  examples: string;
}

export interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
  blocks: PromptBlocks;
}

export const EMPTY_BLOCKS: PromptBlocks = {
  role: "",
  context: "",
  task: "",
  format: "",
  examples: "",
};

export function assemblePrompt(blocks: PromptBlocks): string {
  const sections: string[] = [];
  if (blocks.role.trim()) sections.push(`# Role\n${blocks.role.trim()}`);
  if (blocks.context.trim()) sections.push(`# Context\n${blocks.context.trim()}`);
  if (blocks.task.trim()) sections.push(`# Task\n${blocks.task.trim()}`);
  if (blocks.format.trim()) sections.push(`# Output format\n${blocks.format.trim()}`);
  if (blocks.examples.trim()) sections.push(`# Examples\n${blocks.examples.trim()}`);
  return sections.join("\n\n");
}

export function isPromptEmpty(blocks: PromptBlocks): boolean {
  return assemblePrompt(blocks).length === 0;
}

export const TEMPLATES: Template[] = [
  {
    id: "resume-bullet",
    name: "Resume bullet rewriter",
    emoji: "📄",
    description: "Turn a flat resume line into an impact-driven bullet",
    blocks: {
      role: "Senior technical recruiter at a top-tier tech company. Direct, no fluff.",
      context:
        "Original resume bullet:\n\"Helped the team migrate from MySQL to Postgres last year.\"\n\nThe candidate is applying to a Senior Backend Engineer role at a high-growth fintech.",
      task: "Rewrite this bullet to lead with measurable impact, use a strong action verb, and quantify scope wherever the original implies it. Do not invent numbers — instead, ask 1-2 clarifying questions if a key metric is missing.",
      format:
        "Two parts:\n1. The rewritten bullet (one line, max 25 words).\n2. A short list of clarifying questions if any required metric is missing.",
      examples:
        "Weak: \"Worked on the new checkout page.\"\nStrong: \"Shipped a redesigned checkout that lifted conversion 12% across 2M monthly sessions, owning the React + Stripe integration end-to-end.\"",
    },
  },
  {
    id: "email-reply",
    name: "Polite email reply",
    emoji: "✉️",
    description: "Draft a warm, professional reply to any email",
    blocks: {
      role: "A friendly, professional communicator. Warm but concise. Native English speaker.",
      context:
        "Original email from a customer:\n\n\"Hi — I ordered 2 weeks ago (order #4821) and tracking still shows 'label created'. This is for a birthday gift on Saturday. Can someone please help?\"",
      task: "Draft a reply that acknowledges the frustration, gives a concrete next step (refund or expedited shipping), and offers a small goodwill gesture appropriate for the situation.",
      format:
        "Plain email body only (no subject line, no signature). 4-6 sentences. Use 'we' not 'I'. End with a clear question or action.",
      examples: "",
    },
  },
  {
    id: "code-review",
    name: "Code reviewer",
    emoji: "🔍",
    description: "Get a senior-engineer review of any code snippet",
    blocks: {
      role: "Senior staff engineer with 15 years of TypeScript/React experience. Reviews like Linus — direct, technical, kind but unsparing about bugs.",
      context:
        "The code below is a React hook the team wants to ship to production:\n\n```ts\nexport function useDebounced<T>(value: T, ms: number) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const t = setTimeout(() => setDebounced(value), ms);\n  }, [value]);\n  return debounced;\n}\n```",
      task: "Review the code. Identify correctness bugs first, then style/idiom issues. Suggest the smallest possible diff to fix the most critical issue.",
      format:
        "Three sections, in order:\n1. **Bugs** (numbered, severity: critical/medium/low)\n2. **Suggested fix** (a code block with the corrected version)\n3. **Nits** (optional, max 3 bullets)",
      examples: "",
    },
  },
  {
    id: "eli5",
    name: "ELI5 explainer",
    emoji: "🧒",
    description: "Explain anything in plain English with an analogy",
    blocks: {
      role: "A patient teacher who explains complex topics to curious 10-year-olds. Uses everyday analogies, avoids jargon, never condescends.",
      context: "The topic to explain: \"How does HTTPS keep my data safe?\"",
      task: "Explain the topic so a curious 10-year-old gets the core idea. Lead with one strong analogy from everyday life, then walk through how the analogy maps to the real thing.",
      format:
        "Three short paragraphs:\n1. The analogy (no technical terms).\n2. How the analogy maps to the real concept (introduce 1-2 technical terms here, defined inline).\n3. One surprising fact to make it stick.",
      examples: "",
    },
  },
  {
    id: "meeting-summary",
    name: "Meeting summarizer",
    emoji: "📝",
    description: "Extract decisions + action items from raw meeting notes",
    blocks: {
      role: "An executive assistant who's been in 10,000 meetings. Razor-sharp at separating signal (decisions, owners, deadlines) from noise (banter, tangents).",
      context: "Paste the raw meeting transcript or notes below this line:\n\n[transcript]",
      task: "Read the transcript. Pull out: (a) every decision that was made, (b) every action item with an explicit owner, (c) any unresolved questions someone needs to follow up on. Ignore filler conversation.",
      format:
        "Three sections with these exact headings:\n\n### Decisions\n- ...\n\n### Action items\n- [ ] @owner — task — due [date if mentioned, else 'TBD']\n\n### Open questions\n- ...",
      examples: "",
    },
  },
  {
    id: "blog-outline",
    name: "Blog post outline",
    emoji: "✍️",
    description: "Generate a scannable outline for any topic + audience",
    blocks: {
      role: "Content strategist who has launched 50+ technical blog posts ranked on the first page of Google. Believes great outlines beat great writing.",
      context:
        "Topic: \"How small SaaS teams should think about pricing\"\nAudience: founders and PMs at 5-25 person startups, generally non-finance background\nGoal: drive newsletter signups; not a sales piece",
      task: "Produce a complete outline ready for a writer to draft from. Each H2 should have a single sharp idea, not a generic header. Each H2 must include 2-3 sub-bullets that capture the substance of the section, not just the topic.",
      format:
        "Markdown outline:\n- One-sentence hook (the opening line)\n- 5-7 H2 sections, each with 2-3 sub-bullets\n- A closing CTA section",
      examples: "",
    },
  },
];
