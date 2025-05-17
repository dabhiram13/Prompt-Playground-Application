export interface CaseStudy {
  id: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  tags: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: "customer-support-ai",
    title: "Improving Customer Support AI",
    summary: "A SaaS company improved their customer support chatbot's accuracy by 78% using few-shot prompting with carefully selected examples.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    imageAlt: "Data analysis visualization on computer screen",
    tags: ["Technical Support", "Few-Shot Learning"]
  },
  {
    id: "test-case-generation",
    title: "Generating Test Cases for Developers",
    summary: "A development team reduced QA time by 42% using chain-of-thought prompting to generate comprehensive test cases for new features.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    imageAlt: "Person typing code on a computer",
    tags: ["Software Development", "Chain of Thought"]
  },
  {
    id: "medical-research",
    title: "Accelerating Medical Literature Review",
    summary: "Researchers at a pharmaceutical company used template prompting to analyze thousands of research papers, reducing literature review time by 65%.",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    imageAlt: "Medical research lab with microscope and data",
    tags: ["Medical Research", "Template Prompting"]
  },
  {
    id: "content-localization",
    title: "Optimizing Content Localization Workflow",
    summary: "A global marketing team improved translation quality by 53% and reduced localization costs by implementing role prompting with cultural context.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    imageAlt: "Global marketing team working on computers",
    tags: ["Marketing", "Role Prompting"]
  }
];
