import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

export default function PromptTester() {
  const [prompt, setPrompt] = useState('');
  const [contextData, setContextData] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate AI response with sample response text
    setTimeout(() => {
      const simulatedResponse = generateSimulatedResponse(prompt, contextData);
      setResult(simulatedResponse);
      setIsLoading(false);
      
      // Track usage of the prompt tester
      trackEvent('use_prompt_tester', 'tool_interaction');
    }, 1500);
  };

  const clearForm = () => {
    setPrompt('');
    setContextData('');
    setResult('');
  };

  const samplePrompts = [
    {
      title: "Chat with context",
      prompt: "You are a travel advisor helping me plan a trip to Japan. I want to visit Tokyo, Kyoto, and Osaka in 10 days. Suggest an itinerary that includes major attractions, food recommendations, and transportation tips.",
      context: "User preferences:\n- Interested in cultural sites and technology\n- Food preferences: seafood, street food, authentic cuisine\n- Budget: Mid-range ($150-200/day excluding accommodation)\n- Prefer public transportation\n- Wants at least 2 days in each city"
    },
    {
      title: "Data analysis",
      prompt: "Analyze this sales data and provide insights on trends, top performing products, and recommendations to improve sales.",
      context: "Sales Data (Q1 2023):\nProduct A: 250 units, $12,500 revenue\nProduct B: 180 units, $27,000 revenue\nProduct C: 320 units, $16,000 revenue\nProduct D: 95 units, $14,250 revenue\n\nRegional breakdown:\n- North: 35% of sales\n- South: 25% of sales\n- East: 20% of sales\n- West: 20% of sales"
    },
    {
      title: "Persona-based writing",
      prompt: "Write a product description for our new wireless headphones. Target audience is tech-savvy professionals who value premium audio and convenience.",
      context: "Product specifications:\n- Active noise cancellation\n- 30-hour battery life\n- Premium materials (aluminum and leather)\n- Bluetooth 5.2 with multi-device connection\n- Touch controls\n- Built-in voice assistant\n- Price point: $299\n- Brand position: Luxury audio products with minimalist design"
    }
  ];

  const loadSamplePrompt = (index: number) => {
    setPrompt(samplePrompts[index].prompt);
    setContextData(samplePrompts[index].context);
    setResult('');
  };

  // Function to generate a simulated response based on the prompt and context
  const generateSimulatedResponse = (prompt: string, context: string): string => {
    const promptType = prompt.toLowerCase();
    let response = '';

    if (promptType.includes('travel') || promptType.includes('trip') || promptType.includes('japan')) {
      response = `## Japan 10-Day Itinerary

Based on your preferences, here's a suggested itinerary:

### Days 1-4: Tokyo
- **Day 1**: Arrival, Shibuya crossing, Meiji Shrine
- **Day 2**: Akihabara (tech district), Tokyo National Museum
- **Day 3**: Tsukiji Outer Market, Harajuku, Shinjuku
- **Day 4**: Day trip to Kamakura (Great Buddha)

**Food recommendations**: Sushi at Tsukiji, ramen in Shinjuku, conveyor belt sushi

**Transportation**: Get a PASMO/Suica card for Tokyo metro

### Days 5-7: Kyoto
- **Day 5**: Travel to Kyoto, Kiyomizu-dera Temple
- **Day 6**: Fushimi Inari Shrine, Arashiyama Bamboo Grove
- **Day 7**: Kinkaku-ji (Golden Pavilion), Nishiki Market

**Food recommendations**: Traditional kaiseki dinner, matcha desserts

### Days 8-10: Osaka
- **Day 8**: Osaka Castle, Dotonbori district
- **Day 9**: Universal Studios Japan (if interested) or Umeda Sky Building
- **Day 10**: Final shopping, departure

**Food recommendations**: Takoyaki, okonomiyaki, kushikatsu

**Transportation between cities**: Use JR Pass for Shinkansen (bullet train)`;
    } else if (promptType.includes('sales') || promptType.includes('data') || promptType.includes('analysis')) {
      response = `## Sales Analysis Q1 2023

### Key Insights
1. **Product B** has the highest revenue per unit ($150/unit)
2. **Product C** has the highest volume but lower revenue per unit ($50/unit)
3. **North region** accounts for the largest market share (35%)
4. **Product D** has the lowest volume but good revenue per unit ($150/unit)

### Recommendations
1. **Increase marketing for Product B** in South and East regions to boost high-margin sales
2. **Bundle Products C and D** to increase average order value
3. **Implement targeted promotions** in West and East regions to increase market share
4. **Analyze Product A pricing strategy** - volume is good but revenue per unit is lowest ($50/unit)

### Opportunities
- Explore cross-selling between high-volume Product C customers and high-margin Product B
- Develop a customer loyalty program focusing on the North region to maintain dominance
- Consider seasonal promotions for Q2 based on Q1 performance trends`;
    } else if (promptType.includes('headphones') || promptType.includes('product') || promptType.includes('description')) {
      response = `# ELEVATE: Premium Wireless Headphones for the Discerning Professional

Introducing our flagship ELEVATE wireless headphones - where uncompromising audio meets effortless sophistication.

Engineered for professionals who demand excellence in every aspect of life, ELEVATE headphones seamlessly blend into your fast-paced workflow while delivering an audio experience that transcends the ordinary.

## Immersive Focus On Demand
The advanced active noise cancellation creates your personal sanctuary anywhere - from busy coffee shops to open offices or noisy flights. Toggle between full immersion and ambient awareness with a simple touch.

## All-Day Reliability
With an industry-leading 30-hour battery life, ELEVATE powers through your longest workdays, international flights, and weekend escapes without missing a beat.

## Effortless Integration
Connect simultaneously to multiple devices with Bluetooth 5.2 technology, allowing you to switch seamlessly between your laptop presentation and incoming phone call with zero disruption.

## Refined Materials
Crafted from aircraft-grade aluminum and genuine leather, ELEVATE headphones make a subtle statement about your appreciation for quality and attention to detail.

At $299, ELEVATE isn't just a headphone - it's an investment in your productivity, focus, and audio experience.

*Your time is valuable. Your audio should be exceptional.*`;
    } else {
      response = `Based on your prompt and the context provided, here's a response:

${prompt}

I've considered the following context information:
${context}

For more specific and helpful responses, try providing:
1. Clear objectives of what you want to achieve
2. Relevant background information
3. Any specific format requirements
4. Target audience or tone preferences

The more specific your prompt and context, the better the AI can tailor its response to your needs.`;
    }

    return response;
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden border border-neutral-200 dark:border-neutral-700 p-6">
      <h3 className="text-xl font-semibold mb-4 text-primary dark:text-secondary-light">Prompt Testing Lab</h3>
      <p className="mb-6 text-neutral-700 dark:text-neutral-300">Experiment with different prompts and context information to see how they affect AI responses. Add detailed context to get more precise and relevant outputs.</p>
      
      {/* Sample prompts */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">Try a sample prompt:</h4>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((sample, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm" 
              onClick={() => loadSamplePrompt(index)}
              className="text-xs"
            >
              {sample.title}
            </Button>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Your Prompt:</label>
          <textarea 
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            rows={4}
            required
          />
        </div>
        
        <div>
          <label htmlFor="context" className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
            Context Information <span className="text-xs font-normal">(optional but recommended)</span>:
          </label>
          <textarea 
            id="context"
            value={contextData}
            onChange={(e) => setContextData(e.target.value)}
            placeholder="Add background information, user preferences, data, or any context that helps the AI understand your needs better..."
            className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            rows={5}
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 bg-primary dark:bg-secondary hover:bg-primary-dark dark:hover:bg-secondary-dark text-white font-medium rounded-lg transition duration-200"
          >
            {isLoading ? 'Processing...' : 'Generate Response'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={clearForm}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg transition duration-200"
          >
            Clear
          </Button>
        </div>
      </form>
      
      {result && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-2 text-primary dark:text-secondary-light">Generated Response:</h4>
          <div className="p-4 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800">
            <pre className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 font-mono text-sm overflow-auto">
              {result}
            </pre>
          </div>
          
          <div className="mt-4 p-4 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-100 dark:bg-neutral-700">
            <h5 className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">💡 Pro Tips:</h5>
            <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1 list-disc pl-4">
              <li>Be specific about what you want - vague prompts lead to vague responses</li>
              <li>Include detailed context data for more personalized and accurate results</li>
              <li>Use formatting instructions (bullets, tables, sections) to shape the response structure</li>
              <li>Specify the tone, style, or persona you want the AI to adopt</li>
              <li>Break complex tasks into smaller, clearer instructions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}