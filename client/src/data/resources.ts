interface Resource {
  title: string;
  url: string;
}

interface ResourceCategory {
  title: string;
  icon: string; // Icon name as string
  items: Resource[];
}

export const resources: ResourceCategory[] = [
  {
    title: "Books & Papers",
    icon: "book",
    items: [
      {
        title: "The Art of Prompt Engineering (2023)",
        url: "https://arxiv.org/abs/2302.11382"
      },
      {
        title: "Chain-of-Thought Prompting Elicits Reasoning in LLMs",
        url: "https://arxiv.org/abs/2201.11903"
      },
      {
        title: "Prompt Engineering Guide: Techniques & Strategies",
        url: "https://www.promptingguide.ai/"
      }
    ]
  },
  {
    title: "Video Tutorials",
    icon: "video",
    items: [
      {
        title: "Advanced Prompt Strategies for GPT-4",
        url: "https://www.youtube.com/watch?v=bT8Sfr8nJCY"
      },
      {
        title: "Mastering Few-Shot Learning Techniques",
        url: "https://www.youtube.com/watch?v=5ef83Wljm-M"
      },
      {
        title: "Prompt Engineering for Creative Writing",
        url: "https://www.youtube.com/watch?v=p_WXnIlhRkY"
      }
    ]
  },
  {
    title: "Tools & Templates",
    icon: "tools",
    items: [
      {
        title: "Prompt Template Collection (GitHub)",
        url: "https://github.com/f/awesome-chatgpt-prompts"
      },
      {
        title: "PromptPerfect - Prompt Optimizer",
        url: "https://promptperfect.jina.ai/"
      },
      {
        title: "LangChain Prompt Engineering Guide",
        url: "https://python.langchain.com/docs/modules/model_io/prompts/"
      }
    ]
  }
];
