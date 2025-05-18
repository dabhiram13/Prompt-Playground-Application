import { useState } from "react";
import { Switch, Route } from "wouter";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white py-6 shadow-sm">
        <div className="container mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">PromptActive</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-orange-500">Features</a>
            <a href="#" className="text-gray-700 hover:text-orange-500">Benefits</a>
            <a href="#" className="text-gray-700 hover:text-orange-500">Pricing</a>
            <a href="#" className="text-gray-700 hover:text-orange-500 flex items-center">Pages <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></a>
          </div>
          <button className="bg-white text-gray-800 font-medium py-2 px-4 rounded-full border border-gray-200 hover:shadow-md flex items-center transition-all">
            Get Active 
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </header>
      
      <section className="py-28 relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 top-20 bg-white/10 rounded-full w-72 h-72 blur-3xl"></div>
          <div className="absolute -left-10 bottom-10 bg-white/10 rounded-full w-80 h-80 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10 py-10">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-8">
            <span className="text-sm font-medium mr-2 bg-white/90 text-gray-800 px-2 py-1 rounded-full">New</span>
            <div className="flex items-center text-white">
              <svg className="w-4 h-4 text-orange-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              <span>Smart AI Features</span>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 title-style text-white">
            {"Perfect Every Step for".split('').map((char, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>{char === ' ' ? '\u00A0' : char}</span>
            ))}
            <br />
            {"Extraordinary Prompts.".split('').map((char, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>{char === ' ' ? '\u00A0' : char}</span>
            ))}
          </h1>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10 typing-animation">
            Enhance your workflow for superior results with intelligent targeted prompt strategies.
          </p>
          
          <div className="flex justify-center mb-12">
            <button className="bg-black/20 hover:bg-black/30 text-white font-medium py-3 px-8 rounded-full backdrop-blur-md transition-all flex items-center">
              Explore Active 
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Switch>
          <Route path="/">
            <PromptPlayground />
          </Route>
          
          <Route>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 interactive-card">
              <h2 className="text-xl font-semibold text-red-500 mb-4">404 - Page Not Found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The page you're looking for doesn't exist.
              </p>
              <a href="/" className="text-indigo-500 hover:text-indigo-600 font-medium hover:underline">Go back home</a>
            </div>
          </Route>
        </Switch>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Prompt Engineering Playground &copy; {new Date().getFullYear()}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                About
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                Resources
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PromptPlayground() {
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [result, setResult] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  
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
    },
    {
      id: "context-rich",
      name: "Context Dump",
      template: "I need information about climate change.\n\nContext:\n- The global average temperature has increased by about 1.1°C since the pre-industrial era\n- The IPCC (Intergovernmental Panel on Climate Change) is the UN body evaluating climate science\n- Carbon dioxide levels have increased by 48% since pre-industrial times\n- The Paris Agreement aims to limit global warming to well below 2°C\n- Greenhouse gases trap heat in the Earth's atmosphere\n- Fossil fuel combustion is the primary source of CO2 emissions\n\nQuestion: [Question]\n\nProvide a comprehensive and accurate answer based on the context provided.",
      description: "Provides relevant background information before asking the question"
    },
    {
      id: "goal-oriented",
      name: "Goal-Oriented",
      template: "I need to create a presentation for high school students explaining climate change.\n\nMy specific goals are:\n1. Keep the explanation simple and engaging for teenagers\n2. Include 3-4 key scientific facts that are easy to understand\n3. Avoid political controversies while remaining accurate\n4. End with practical actions students can take\n\nQuestion: [Question]\n\nPlease tailor your response to help me achieve these specific goals.",
      description: "Clearly states the purpose and constraints for the response"
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
      const responseData = generateResponse(processedPrompt, selectedTemplate);
      setResult(responseData.response);
      setSuggestion(responseData.suggestion || "");
      setIsLoading(false);
    }, 1500);
  };
  
  const generateResponse = (promptText: string, templateType: string): { response: string, suggestion?: string } => {
    // These are simulated responses to demonstrate different prompt strategies
    let response = "";
    let suggestion = "";
    
    if (promptText.includes("climate change")) {
      switch (templateType) {
        case "zero-shot":
          response = "Climate change is primarily caused by the increase in greenhouse gases in Earth's atmosphere, mainly carbon dioxide from burning fossil fuels. These gases trap heat and raise global temperatures, leading to melting ice caps, rising sea levels, and extreme weather events.";
          suggestion = "This basic response lacks detail. Try using the Context Dump template for more accurate, fact-based responses, or the Goal-Oriented template if you have a specific purpose in mind.";
          break;
          
        case "few-shot":
          response = "The capital of France is Paris.\n\nThe capital of Japan is Tokyo.\n\nClimate change is primarily caused by human activities that release greenhouse gases into the atmosphere. The main contributor is the burning of fossil fuels (coal, oil, and natural gas), which releases carbon dioxide. Deforestation, industrial processes, and certain agricultural practices also contribute significantly to greenhouse gas emissions. These gases trap heat in the atmosphere, causing global temperatures to rise, which leads to melting ice caps, rising sea levels, and increasingly severe weather events.";
          suggestion = "Notice how the response follows the pattern established by examples. For even better results, use examples that are truly similar to your target question.";
          break;
          
        case "chain-of-thought":
          response = "Let's think about this step-by-step:\n\n1. First, let's consider what climate change actually is: It's a long-term change in temperature and weather patterns on Earth.\n\n2. For changes to happen to our climate, something must be affecting the Earth's energy balance.\n\n3. The primary driver is greenhouse gases in the atmosphere, which trap heat from the sun.\n\n4. The main greenhouse gases are carbon dioxide, methane, nitrous oxide, and water vapor.\n\n5. Human activities have significantly increased the concentration of these gases, especially CO2, through:\n   - Burning fossil fuels for electricity, heat, and transportation\n   - Deforestation (trees absorb CO2)\n   - Industrial processes and manufacturing\n   - Agricultural practices like rice cultivation and livestock raising (methane)\n\n6. Natural factors like volcanic eruptions and variations in solar radiation play a role, but they cannot explain the rapid warming observed in recent decades.\n\n7. The evidence shows a strong correlation between increased greenhouse gas concentrations and rising global temperatures.\n\nConclusion: Climate change is primarily caused by human activities that increase greenhouse gas concentrations in the atmosphere, with the burning of fossil fuels being the largest contributor.";
          suggestion = "This step-by-step reasoning is excellent for complex topics. For maximum effectiveness, combine this approach with context-rich prompting to ensure each step is based on accurate information.";
          break;
          
        case "role-play":
          response = "As a climate scientist with over 15 years of research experience in atmospheric physics, I can explain that climate change is fundamentally driven by an enhancement of Earth's natural greenhouse effect.\n\nThe primary cause is anthropogenic (human-caused) greenhouse gas emissions. When we burn fossil fuels like coal, oil, and natural gas, we release carbon dioxide (CO₂) that has been stored underground for millions of years. Deforestation compounds this issue by reducing the planet's capacity to reabsorb this carbon.\n\nThese greenhouse gases function like a blanket around the Earth, trapping heat that would otherwise escape to space. We've increased atmospheric CO₂ from about 280 parts per million (ppm) in pre-industrial times to over 415 ppm today.\n\nWhile natural factors like volcanic eruptions and solar variations do affect climate, rigorous analysis of all forcing factors clearly demonstrates that observed warming since the mid-20th century is predominantly due to human activities.\n\nThe scientific consensus on this causation is overwhelming, supported by multiple independent lines of evidence including satellite measurements, ocean heat content, ice core samples, and sophisticated climate models.";
          suggestion = "The role-based prompt produces authoritative content with domain-specific terminology. Be specific about what expertise you need - for example, specifying 'climate scientist with experience in atmospheric physics' rather than just 'scientist'.";
          break;
          
        case "structured-output":
          response = "```json\n{\n  \"answer\": \"Climate change is primarily caused by human activities that release greenhouse gases into the atmosphere.\",\n  \"reasoning\": \"The main greenhouse gas is carbon dioxide (CO2), released through burning fossil fuels like coal, oil, and natural gas for energy, transportation, and industrial processes. Methane, another powerful greenhouse gas, is released from agricultural activities, waste management, and fossil fuel extraction. Deforestation reduces the Earth's capacity to absorb CO2. These greenhouse gases trap heat in the atmosphere, causing global temperatures to rise, which leads to various climate impacts.\",\n  \"sources\": [\n    \"IPCC Sixth Assessment Report (2021)\",\n    \"NASA Global Climate Change Portal\",\n    \"National Oceanic and Atmospheric Administration (NOAA) Climate Data\"\n  ]\n}\n```";
          suggestion = "Structured output makes information extraction easy. Be very specific about the format you want (fields, data types, etc.) for consistent results you can process programmatically.";
          break;
          
        case "context-rich":
          response = "Based on the context provided, climate change is caused by an increase in greenhouse gases in Earth's atmosphere, primarily from fossil fuel combustion. These greenhouse gases, particularly carbon dioxide (which has increased 48% since pre-industrial times), trap heat in the Earth's atmosphere through the greenhouse effect.\n\nThe result is a global average temperature increase of about 1.1°C since the pre-industrial era. This warming has wide-ranging effects on Earth's climate systems.\n\nAccording to the IPCC (the UN body evaluating climate science), human activities are unequivocally the main driver of these changes. The Paris Agreement represents an international effort to address this issue by limiting global warming to well below 2°C compared to pre-industrial levels.\n\nThe primary mechanism of climate change involves greenhouse gases creating an insulating layer that prevents heat from escaping Earth's atmosphere, similar to how a greenhouse retains heat.";
          suggestion = "This answer is precise and factual because it's based on the specific context provided. For your own prompts, include relevant facts, statistics, or background information that will help generate accurate responses.";
          break;
          
        case "goal-oriented":
          response = "Here's a response tailored for your high school student presentation on what causes climate change:\n\n# What Causes Climate Change: The Simple Science\n\n## Key Facts Students Will Understand\n1. **The Greenhouse Effect**: Certain gases in our atmosphere (like CO2) act like a blanket, trapping heat from the sun that would normally escape into space.\n\n2. **Human Activities**: When we burn fossil fuels like coal, oil, and gas for electricity, transportation, and industry, we release more of these greenhouse gases.\n\n3. **Measurable Changes**: Scientists have measured that CO2 levels have increased by over 40% since the Industrial Revolution, and global temperatures have risen by about 1°C.\n\n## The Science Without the Politics\nThink of our atmosphere like the windows of a car parked in the sun. Sunlight passes through easily, but the heat gets trapped inside. This is happening to our planet on a global scale, and we can measure the changes.\n\n## What Students Can Do\n- Consider walking, biking, or using public transportation when possible\n- Reduce food waste (food production creates greenhouse gases)\n- Help their families save energy at home through simple habits\n- Share what they've learned with friends and family\n\nThis explanation keeps the science straightforward while avoiding political debates, and empowers students with actions they can personally take.";
          suggestion = "This response follows your specific goals perfectly. Always clearly state your purpose and audience when asking AI to create content for you - it significantly improves relevance and usability.";
          break;
          
        default:
          response = "Climate change is primarily caused by human activities that release greenhouse gases into the atmosphere, mainly from burning fossil fuels, which trap heat and cause global warming.";
      }
    } else {
      response = "I've processed your prompt, but I don't see a specific question about climate change. Please make sure you replace [Question] in the template with your actual question, or try a different topic of interest.";
    }
    
    return { response, suggestion };
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6 border border-gray-200 interactive-card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Prompt Templates</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select a template to see how different prompt structures affect the output
          </p>
          
          <div className="space-y-3">
            {promptTemplates.map((template) => (
              <div 
                key={template.id}
                className={`interactive-card border rounded-md p-4 cursor-pointer transition-all ${
                  selectedTemplate === template.id 
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-900/20 shadow-md' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-center">
                  {selectedTemplate === template.id && (
                    <span className="flex h-2 w-2 relative mr-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  )}
                  <h3 className="font-medium text-gray-800 dark:text-white">{template.name}</h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{template.description}</p>
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
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 interactive-card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Playground</h2>
          
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
                className="btn"
              >
                <svg height="24" width="24" className="sparkle" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span className="text">{isLoading ? 'Processing...' : 'Generate Response'}</span>
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
              
              {/* Analysis & Suggestions */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Prompt Strategy Analysis
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {suggestion || (
                    <>
                      {selectedTemplate === "zero-shot" && "This response provides a basic explanation without much depth. Zero-shot prompts work well for simple questions but may lack detail or nuance."}
                      {selectedTemplate === "few-shot" && "Notice how the response follows the pattern of the examples provided. Few-shot learning helps the AI understand the expected format and level of detail."}
                      {selectedTemplate === "chain-of-thought" && "This response breaks down the reasoning process step by step, showing the logical progression that leads to the conclusion. This approach is excellent for complex topics that require explanation."}
                      {selectedTemplate === "role-play" && "By asking the AI to respond as an expert, you get more authoritative, detailed information with domain-specific terminology and context."}
                      {selectedTemplate === "structured-output" && "The structured format makes it easy to extract specific information and ensures the response includes all requested components in a consistent format."}
                      {selectedTemplate === "context-rich" && "This response is grounded in the specific facts provided in the context, making it more accurate and reliable than responses based solely on the model's internal knowledge."}
                      {selectedTemplate === "goal-oriented" && "By specifying your goals and constraints upfront, you get content that precisely matches your needs rather than generic information that requires heavy editing."}
                      {!selectedTemplate && "Select a template and generate a response to see an analysis of the prompt strategy."}
                    </>
                  )}
                </p>
              </div>
              
              {/* Try Another Approach Section */}
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                <h4 className="font-medium text-green-800 dark:text-green-200 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Tips for Better Results
                </h4>
                
                <div className="mt-2">
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Want to improve your results? Try these approaches:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {selectedTemplate !== "context-rich" && (
                      <button
                        onClick={() => handleTemplateSelect("context-rich")}
                        className="text-xs text-left p-2 border border-green-200 dark:border-green-700 rounded bg-white dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        <span className="font-medium block">Add Context</span>
                        <span className="text-gray-600 dark:text-gray-400">Include relevant facts and background information</span>
                      </button>
                    )}
                    
                    {selectedTemplate !== "goal-oriented" && (
                      <button
                        onClick={() => handleTemplateSelect("goal-oriented")}
                        className="text-xs text-left p-2 border border-green-200 dark:border-green-700 rounded bg-white dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        <span className="font-medium block">Specify Goals</span>
                        <span className="text-gray-600 dark:text-gray-400">Clearly state your purpose and constraints</span>
                      </button>
                    )}
                    
                    {selectedTemplate !== "chain-of-thought" && (
                      <button
                        onClick={() => handleTemplateSelect("chain-of-thought")}
                        className="text-xs text-left p-2 border border-green-200 dark:border-green-700 rounded bg-white dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        <span className="font-medium block">Step-by-Step Reasoning</span>
                        <span className="text-gray-600 dark:text-gray-400">Break down complex problems methodically</span>
                      </button>
                    )}
                    
                    {selectedTemplate !== "structured-output" && (
                      <button
                        onClick={() => handleTemplateSelect("structured-output")}
                        className="text-xs text-left p-2 border border-green-200 dark:border-green-700 rounded bg-white dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                      >
                        <span className="font-medium block">Structure the Output</span>
                        <span className="text-gray-600 dark:text-gray-400">Request specific format (JSON, tables, etc.)</span>
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-green-700 dark:text-green-300 mt-3">
                    <strong>Pro tip:</strong> Combining multiple techniques often yields the best results. For example, try using context-rich content with step-by-step reasoning.
                  </p>
                </div>
              </div>
              
              {/* Create Custom Prompt Section */}
              <div className="mt-6">
                <button
                  onClick={() => setIsInteractive(!isInteractive)}
                  className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center"
                >
                  {isInteractive ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Hide Interactive Builder
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Custom Prompt
                    </>
                  )}
                </button>
                
                {isInteractive && (
                  <div className="mt-3 p-4 border border-blue-200 dark:border-blue-800 rounded-md bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-3">Interactive Prompt Builder</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Topic/Question
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-md border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                          placeholder="What causes climate change?"
                          onChange={(e) => {
                            const newPrompt = prompt.replace("[Question]", e.target.value);
                            setPrompt(newPrompt);
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Context (Optional)
                        </label>
                        <textarea 
                          rows={3}
                          className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-md border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                          placeholder="Add relevant facts, background information, or data..."
                          onChange={(e) => {
                            const customPrompt = `${prompt}\n\nAdditional Context:\n${e.target.value}`;
                            setPrompt(customPrompt);
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Specific Goals/Requirements (Optional)
                        </label>
                        <textarea 
                          rows={2}
                          className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-md border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                          placeholder="What's your goal? E.g., 'I need a simple explanation for 10-year-olds' or 'I need technical details with citations'"
                          onChange={(e) => {
                            const customPrompt = `${prompt}\n\nPlease meet these specific requirements:\n${e.target.value}`;
                            setPrompt(customPrompt);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;