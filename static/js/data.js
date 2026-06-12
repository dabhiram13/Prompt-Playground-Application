// Block specs and starter templates (static data only).

export const BLOCK_SPECS = [
  {
    key: "role", label: "Role",
    why: "Tells the model who to be. Sets tone, vocabulary, and authority. The single highest-leverage line in most prompts.",
    placeholder: "e.g. A senior staff engineer who reviews code like Linus — direct, technical, kind but unsparing.",
    rows: 2,
    chips: ["Senior software engineer", "Friendly tutor", "Marketing copywriter", "Ruthless editor", "Climate scientist"],
  },
  {
    key: "context", label: "Context",
    why: "Everything the model needs to know but can't infer: data, history, constraints, your situation. Use {{variables}} for the parts that change each time.",
    placeholder: "e.g. Here's the job posting:\n{{job_posting}}",
    rows: 5,
  },
  {
    key: "task", label: "Task",
    why: "The actual ask. Be specific about what the model should produce — vague tasks get vague answers.",
    placeholder: "e.g. Review the code and find correctness bugs first, then style issues.",
    rows: 3,
  },
  {
    key: "format", label: "Format",
    why: "How the answer should be structured. Forces the model to be useful instead of rambling.",
    placeholder: "e.g. Markdown with three sections: ## Bugs, ## Suggested fix, ## Nits.",
    rows: 2,
    chips: ["Bullet list", "JSON", "Markdown table", "Single paragraph", "Code block"],
  },
  {
    key: "examples", label: "Examples",
    why: "Show, don't just tell. One or two before/after examples teaches the model what 'good' looks like in your domain.",
    placeholder: "e.g.\nInput: ...\nOutput: ...",
    rows: 4, optional: true,
  },
];

export const TEMPLATES = [
  {
    id: "resume-bullet", name: "Resume bullet rewriter", emoji: "📄",
    description: "Turn a flat resume line into an impact-driven bullet",
    blocks: {
      role: "Senior technical recruiter at a top-tier tech company. Direct, no fluff.",
      context: "Original resume bullet:\n{{resume_bullet}}\n\nThe candidate is applying to: {{target_role}}",
      task: "Rewrite this bullet to lead with measurable impact, use a strong action verb, and quantify scope wherever the original implies it. Do not invent numbers — instead, ask 1-2 clarifying questions if a key metric is missing.",
      format: "Two parts:\n1. The rewritten bullet (one line, max 25 words).\n2. A short list of clarifying questions if any required metric is missing.",
      examples: 'Weak: "Worked on the new checkout page."\nStrong: "Shipped a redesigned checkout that lifted conversion 12% across 2M monthly sessions, owning the React + Stripe integration end-to-end."',
    },
  },
  {
    id: "email-reply", name: "Difficult email reply", emoji: "✉️",
    description: "Draft a warm, professional reply to any email",
    blocks: {
      role: "A friendly, professional communicator. Warm but concise.",
      context: "The email I received:\n{{email}}\n\nWhat I want to happen: {{goal}}",
      task: "Draft a reply that acknowledges the sender's concern, moves toward my goal, and keeps the relationship intact.",
      format: "Plain email body only (no subject, no signature). 4-6 sentences. End with a clear question or action.",
      examples: "",
    },
  },
  {
    id: "code-review", name: "Code reviewer", emoji: "🔍",
    description: "Get a senior-engineer review of any code snippet",
    blocks: {
      role: "Senior staff engineer with 15 years of experience. Reviews like Linus — direct, technical, kind but unsparing about bugs.",
      context: "The code to review:\n\n{{code}}",
      task: "Review the code. Identify correctness bugs first, then style/idiom issues. Suggest the smallest possible diff to fix the most critical issue.",
      format: "Three sections, in order:\n1. **Bugs** (numbered, severity: critical/medium/low)\n2. **Suggested fix** (a code block with the corrected version)\n3. **Nits** (optional, max 3 bullets)",
      examples: "",
    },
  },
  {
    id: "eli5", name: "ELI5 explainer", emoji: "🧒",
    description: "Explain anything in plain English with an analogy",
    blocks: {
      role: "A patient teacher who explains complex topics to curious 10-year-olds. Uses everyday analogies, avoids jargon, never condescends.",
      context: "The topic to explain: {{topic}}",
      task: "Explain the topic so a curious 10-year-old gets the core idea. Lead with one strong analogy from everyday life, then walk through how the analogy maps to the real thing.",
      format: "Three short paragraphs:\n1. The analogy (no technical terms).\n2. How the analogy maps to the real concept (1-2 technical terms, defined inline).\n3. One surprising fact to make it stick.",
      examples: "",
    },
  },
  {
    id: "meeting-summary", name: "Meeting summarizer", emoji: "📝",
    description: "Extract decisions + action items from raw notes",
    blocks: {
      role: "An executive assistant who's been in 10,000 meetings. Razor-sharp at separating signal from noise.",
      context: "Raw meeting notes:\n\n{{notes}}",
      task: "Pull out: (a) every decision made, (b) every action item with an explicit owner, (c) unresolved questions someone needs to follow up on. Ignore filler.",
      format: "### Decisions\n- ...\n\n### Action items\n- [ ] @owner — task — due [date or 'TBD']\n\n### Open questions\n- ...",
      examples: "",
    },
  },
  {
    id: "study-plan", name: "Study plan builder", emoji: "🎓",
    description: "Week-by-week plan for any exam or skill",
    blocks: {
      role: "A learning coach who designs realistic study plans people actually finish. Optimizes for consistency over intensity.",
      context: "Goal: {{goal}}\nDeadline: {{deadline}}\nHours available per week: {{hours_per_week}}",
      task: "Build a week-by-week study plan from today to the deadline. Front-load fundamentals, schedule spaced reviews, and include one mock test or self-check per week in the second half.",
      format: "Markdown table: Week | Focus | Concrete tasks | Self-check. Then 3 bullet rules for staying on track.",
      examples: "",
    },
  },
];
