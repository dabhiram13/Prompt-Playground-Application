export interface Technique {
  id: string;
  title: string;
  summary: string;
  description: string;
  example: string;
  whenToUse: string[];
  tips: string[];
}

export const techniques: Technique[] = [
  {
    id: "zero-shot",
    title: "Zero-Shot Prompting",
    summary: "Getting results without providing specific examples",
    description: "Zero-shot prompting is a technique where you ask the AI to perform a task without providing examples of the task being completed.",
    example: "Write a product description for a new eco-friendly water bottle that keeps drinks cold for 24 hours. The target audience is active outdoor enthusiasts.",
    whenToUse: [
      "For straightforward tasks that don't require specialized formatting",
      "When you want a fresh, unbiased approach",
      "For initial drafts that you plan to refine later"
    ],
    tips: [
      "Be clear and specific about what you want",
      "Specify audience, tone, and context",
      "Include constraints or requirements",
      "Ask for a specific format if needed"
    ]
  },
  {
    id: "few-shot",
    title: "Few-Shot Examples",
    summary: "Providing examples to guide the model's response",
    description: "Few-shot prompting involves giving the AI model a few examples that demonstrate the pattern or format you want it to follow.",
    example: `Convert these sentences to French:

English: "Hello, how are you?"
French: "Bonjour, comment allez-vous?"

English: "Where is the library?"
French: "Où est la bibliothèque?"

English: "I would like a coffee, please."
French:`,
    whenToUse: [
      "For tasks with specific formatting requirements",
      "When consistency across outputs is important",
      "For specialized or niche tasks",
      "When zero-shot attempts produce unsatisfactory results"
    ],
    tips: [
      "Use diverse examples to help the model generalize",
      "Include 2-4 examples for best results",
      "Make your examples representative of what you want",
      "Structure examples consistently"
    ]
  },
  {
    id: "cot",
    title: "Chain of Thought",
    summary: "Guiding models to show their reasoning process",
    description: "Chain of Thought (CoT) prompting encourages the AI to break down complex problems into intermediate steps, showing its reasoning process.",
    example: `Problem: A shop sells a shirt for $24.50. If they offer a 15% discount, and a customer uses a $5 coupon after the discount, what is the final price?

Let's think through this step by step.`,
    whenToUse: [
      "For mathematical or logical problems",
      "When solving multi-step reasoning tasks",
      "To verify the model's understanding of a complex process",
      "When accuracy is critical"
    ],
    tips: [
      "Explicitly ask the model to \"think step by step\"",
      "Consider providing an example of step-by-step reasoning",
      "For complex problems, break them into smaller parts",
      "Review the steps to identify potential errors in reasoning"
    ]
  },
  {
    id: "refinement",
    title: "Iterative Refinement",
    summary: "Gradually improving outputs through feedback cycles",
    description: "Iterative refinement involves taking the initial output from the AI, providing feedback, and asking for improvements in subsequent prompts.",
    example: `Initial prompt: Write a short email to my team about the upcoming project deadline.

Refinement: This is good, but could you make it more urgent and include a bullet point list of the three most important deliverables?`,
    whenToUse: [
      "For creative writing or content creation",
      "When initial outputs are close but not perfect",
      "For complex requests with multiple requirements",
      "When quality and precision are important"
    ],
    tips: [
      "Be specific about what needs improvement",
      "Focus on one or two aspects at a time",
      "Provide positive feedback along with suggestions",
      "Consider multiple iterations for important content"
    ]
  },
  {
    id: "role-prompting",
    title: "Role Prompting",
    summary: "Assigning a specific role to the AI for specialized responses",
    description: "Role prompting involves instructing the AI to assume a particular role or expertise when generating responses, tailoring the output to match that perspective.",
    example: `Act as an experienced pediatrician. A parent asks you about their 2-year-old who has had a fever of 101°F for the past 24 hours and seems uncomfortable. What questions would you ask the parent and what initial advice would you provide?`,
    whenToUse: [
      "When you need expertise in a specific domain",
      "To get responses from a particular perspective",
      "For creative writing with distinct character voices",
      "When simulating professional advice or specialized knowledge"
    ],
    tips: [
      "Define the role clearly with relevant qualifications",
      "Include specific context that the role would need",
      "Consider adding constraints that match ethical guidelines for that role",
      "Be specific about the format you expect from that role"
    ]
  },
  {
    id: "system-instructions",
    title: "System Instructions",
    summary: "Setting global behavior parameters for the conversation",
    description: "System instructions provide foundational guidelines for how the model should behave throughout the entire conversation, establishing persistent parameters for style, constraints, and approach.",
    example: `System: You are a technical writing assistant with expertise in documenting APIs. Respond in a clear, concise style following technical writing best practices. Always include code examples when appropriate, formatted properly with syntax highlighting. Avoid using marketing language or unnecessary adjectives.

User: How should I document the authentication process for my REST API?`,
    whenToUse: [
      "To establish consistent behavior across multiple prompts",
      "When working with models that support system messages (like ChatGPT)",
      "To set persistent constraints or guidelines",
      "For professional use cases requiring a specific tone or style"
    ],
    tips: [
      "Make system instructions clear and comprehensive",
      "Prioritize the most important guidelines first",
      "Consider both what the model should and shouldn't do",
      "Test system instructions with various user inputs to ensure they work as expected"
    ]
  },
  {
    id: "template-prompting",
    title: "Template Prompting",
    summary: "Using structured templates for consistent outputs",
    description: "Template prompting involves creating standardized prompt structures with clear placeholders that can be filled in for different instances of similar tasks.",
    example: `Please analyze the following [DOCUMENT TYPE] about [TOPIC]:

"[CONTENT]"

Provide a summary that includes:
1. Main argument or purpose
2. Key supporting points
3. Any significant evidence presented
4. Target audience
5. Potential biases or limitations

Format your response as bullet points under each heading.`,
    whenToUse: [
      "For repetitive tasks that follow the same structure",
      "When consistency across multiple outputs is critical",
      "In workflows where different team members need to prompt AI in the same way",
      "To simplify complex prompting patterns for non-technical users"
    ],
    tips: [
      "Use clear placeholders with descriptive names",
      "Include specific formatting instructions in the template",
      "Test templates with various inputs to ensure flexibility",
      "Document templates with examples for other users",
      "Consider creating a library of templates for different use cases"
    ]
  },
  {
    id: "constraint-prompting",
    title: "Constraint Prompting",
    summary: "Setting specific limitations to guide responses",
    description: "Constraint prompting involves explicitly stating limitations, requirements, or boundaries that the AI should adhere to when generating responses.",
    example: `Write a product description for a premium coffee maker with these constraints:
- Maximum 150 words
- Must highlight exactly 3 key features
- Include exactly 1 customer testimonial (fictional is fine)
- Do not mention price
- Use active voice throughout
- Reading level: 8th grade
- End with a clear call to action`,
    whenToUse: [
      "When you need precise control over the output format or content",
      "For outputs with specific length requirements",
      "In contexts where certain topics should be avoided",
      "When targeting specific reading levels or audiences"
    ],
    tips: [
      "State constraints clearly and at the beginning of the prompt",
      "Number or bullet point constraints for clarity",
      "Prioritize the most important constraints first",
      "Be specific about what should be excluded as well as included",
      "Check if all constraints were followed and remind the AI if necessary"
    ]
  }
];
