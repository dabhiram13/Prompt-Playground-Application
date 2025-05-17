import { useState } from "react";
import { Switch, Route } from "wouter";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Prompt Engineering Playground</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Test different prompt structures and see the results</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/">
            <PromptPlayground />
          </Route>
          
          <Route>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-500 mb-4">404 - Page Not Found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The page you're looking for doesn't exist.
              </p>
              <a href="/" className="text-blue-500 hover:underline">Go back home</a>
            </div>
          </Route>
        </Switch>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Prompt Engineering Playground &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function PromptPlayground() {
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const promptTemplates = [
    {
      id: "zero-shot",
      name: "Zero-Shot",
      template: "Generate a response to the following question:\n\n[Question]",
      description: "Basic prompt with no examples or context"
    },
    {
      id: "few-shot",
      name: "Few-Shot Learning",
      template: "Here are some examples:\n\nQuestion: What is the capital of France?\nAnswer: The capital of France is Paris.\n\nQuestion: What is the capital of Japan?\nAnswer: The capital of Japan is Tokyo.\n\nQuestion: [Question]\nAnswer:",
      description: "Provides examples before asking the question"
    },
    {
      id: "chain-of-thought",
      template: "Question: [Question]\n\nLet's think about this step-by-step:",
      name: "Chain of Thought",
      description: "Encourages step-by-step reasoning"
    },
    {
      id: "role-play",
      name: "Role-Based",
      template: "You are an expert in [field]. Explain the following concept:\n\n[Question]",
      description: "Assigns a specific role or expertise to the AI"
    },
    {
      id: "structured-output",
      name: "Structured Output",
      template: "Generate a response to this question: [Question]\n\nFormat your answer as JSON with the following structure:\n{\n  \"answer\": \"your main answer\",\n  \"reasoning\": \"explanation of your thinking\",\n  \"sources\": [\"relevant sources\"]\n}",
      description: "Requests a specific output format (like JSON)"
    }
  ];
  
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = promptTemplates.find(t => t.id === templateId);
    if (template) {
      setPrompt(template.template);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const processedPrompt = prompt.replace("[Question]", "What causes climate change?");
      setResult(generateResponse(processedPrompt, selectedTemplate));
      setIsLoading(false);
    }, 1500);
  };
  
  const generateResponse = (promptText: string, templateType: string): string => {
    // These are simulated responses to demonstrate different prompt strategies
    
    if (promptText.includes("climate change")) {
      switch (templateType) {
        case "zero-shot":
          return "Climate change is primarily caused by the increase in greenhouse gases in Earth's atmosphere, mainly carbon dioxide from burning fossil fuels. These gases trap heat and raise global temperatures, leading to melting ice caps, rising sea levels, and extreme weather events.";
          
        case "few-shot":
          return "The capital of France is Paris.\n\nThe capital of Japan is Tokyo.\n\nClimate change is primarily caused by human activities that release greenhouse gases into the atmosphere. The main contributor is the burning of fossil fuels (coal, oil, and natural gas), which releases carbon dioxide. Deforestation, industrial processes, and certain agricultural practices also contribute significantly to greenhouse gas emissions. These gases trap heat in the atmosphere, causing global temperatures to rise, which leads to melting ice caps, rising sea levels, and increasingly severe weather events.";
          
        case "chain-of-thought":
          return "Let's think about this step-by-step:\n\n1. First, let's consider what climate change actually is: It's a long-term change in temperature and weather patterns on Earth.\n\n2. For changes to happen to our climate, something must be affecting the Earth's energy balance.\n\n3. The primary driver is greenhouse gases in the atmosphere, which trap heat from the sun.\n\n4. The main greenhouse gases are carbon dioxide, methane, nitrous oxide, and water vapor.\n\n5. Human activities have significantly increased the concentration of these gases, especially CO2, through:\n   - Burning fossil fuels for electricity, heat, and transportation\n   - Deforestation (trees absorb CO2)\n   - Industrial processes and manufacturing\n   - Agricultural practices like rice cultivation and livestock raising (methane)\n\n6. Natural factors like volcanic eruptions and variations in solar radiation play a role, but they cannot explain the rapid warming observed in recent decades.\n\n7. The evidence shows a strong correlation between increased greenhouse gas concentrations and rising global temperatures.\n\nConclusion: Climate change is primarily caused by human activities that increase greenhouse gas concentrations in the atmosphere, with the burning of fossil fuels being the largest contributor.";
          
        case "role-play":
          return "As a climate scientist with over 15 years of research experience in atmospheric physics, I can explain that climate change is fundamentally driven by an enhancement of Earth's natural greenhouse effect.\n\nThe primary cause is anthropogenic (human-caused) greenhouse gas emissions. When we burn fossil fuels like coal, oil, and natural gas, we release carbon dioxide (CO₂) that has been stored underground for millions of years. Deforestation compounds this issue by reducing the planet's capacity to reabsorb this carbon.\n\nThese greenhouse gases function like a blanket around the Earth, trapping heat that would otherwise escape to space. We've increased atmospheric CO₂ from about 280 parts per million (ppm) in pre-industrial times to over 415 ppm today.\n\nWhile natural factors like volcanic eruptions and solar variations do affect climate, rigorous analysis of all forcing factors clearly demonstrates that observed warming since the mid-20th century is predominantly due to human activities.\n\nThe scientific consensus on this causation is overwhelming, supported by multiple independent lines of evidence including satellite measurements, ocean heat content, ice core samples, and sophisticated climate models.";
          
        case "structured-output":
          return "```json\n{\n  \"answer\": \"Climate change is primarily caused by human activities that release greenhouse gases into the atmosphere.\",\n  \"reasoning\": \"The main greenhouse gas is carbon dioxide (CO2), released through burning fossil fuels like coal, oil, and natural gas for energy, transportation, and industrial processes. Methane, another powerful greenhouse gas, is released from agricultural activities, waste management, and fossil fuel extraction. Deforestation reduces the Earth's capacity to absorb CO2. These greenhouse gases trap heat in the atmosphere, causing global temperatures to rise, which leads to various climate impacts.\",\n  \"sources\": [\n    \"IPCC Sixth Assessment Report (2021)\",\n    \"NASA Global Climate Change Portal\",\n    \"National Oceanic and Atmospheric Administration (NOAA) Climate Data\"\n  ]\n}\n```";
          
        default:
          return "Climate change is primarily caused by human activities that release greenhouse gases into the atmosphere, mainly from burning fossil fuels, which trap heat and cause global warming.";
      }
    } else {
      return "I've processed your prompt, but I don't see a specific question about climate change. Please make sure you replace [Question] in the template with your actual question, or try a different topic of interest.";
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Prompt Templates</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select a template to see how different prompt structures affect the output
          </p>
          
          <div className="space-y-3">
            {promptTemplates.map((template) => (
              <div 
                key={template.id}
                className={`border rounded-md p-3 cursor-pointer transition-colors ${
                  selectedTemplate === template.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <h3 className="font-medium text-gray-800 dark:text-white">{template.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">Tips for Effective Prompts</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
              <li>Be specific about what you want</li>
              <li>Provide context and constraints</li>
              <li>Break complex tasks into steps</li>
              <li>Specify the format you want for the answer</li>
              <li>Use examples to demonstrate the pattern</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Playground</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Prompt
              </label>
              <textarea
                id="prompt"
                rows={10}
                className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-md border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                placeholder="Enter your prompt here or select a template..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Note: Any [Question] placeholders will be replaced with "What causes climate change?" for demonstration
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Generate Response'}
              </button>
            </div>
          </form>
          
          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Response</h3>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-4">
                <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">
                  {result}
                </pre>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">Analysis</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {selectedTemplate === "zero-shot" && "This response provides a basic explanation without much depth. Zero-shot prompts work well for simple questions but may lack detail or nuance."}
                  {selectedTemplate === "few-shot" && "Notice how the response follows the pattern of the examples provided. Few-shot learning helps the AI understand the expected format and level of detail."}
                  {selectedTemplate === "chain-of-thought" && "This response breaks down the reasoning process step by step, showing the logical progression that leads to the conclusion. This approach is excellent for complex topics that require explanation."}
                  {selectedTemplate === "role-play" && "By asking the AI to respond as an expert, you get more authoritative, detailed information with domain-specific terminology and context."}
                  {selectedTemplate === "structured-output" && "The structured format makes it easy to extract specific information and ensures the response includes all requested components in a consistent format."}
                  {!selectedTemplate && "Select a template and generate a response to see an analysis of the prompt strategy."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;