export interface Example {
  id: string;
  title: string;
  originalPrompt: string;
  originalResponse: string;
  enhancedPrompt: string;
  enhancedResponse: string;
  keyImprovements: string[];
}

export const examples: Example[] = [
  {
    id: "technical-documentation",
    title: "Creating Technical Documentation",
    originalPrompt: "Write API documentation for my image processing service.",
    originalResponse: `<h5 class="font-bold mb-2">Image Processing API Documentation</h5>
<p class="mb-2">This documentation covers the Image Processing Service API. The API allows you to perform various operations on images.</p>
<p class="mb-2">Endpoints:</p>
<ul class="list-disc pl-5 mb-2">
  <li>GET /images - List all images</li>
  <li>POST /images - Upload a new image</li>
  <li>GET /images/{id} - Get a specific image</li>
  <li>DELETE /images/{id} - Delete an image</li>
</ul>
<p>For more information, contact support.</p>`,
    enhancedPrompt: `Create comprehensive API documentation for an image processing RESTful service that offers resizing, format conversion, and filtering. Include these sections:
1. Introduction (purpose and key features)
2. Authentication (using API keys)
3. Endpoints with examples in curl and JavaScript
4. Request/response formats in JSON
5. Error codes and troubleshooting
6. Rate limits

Format as Markdown. Target audience is developers with REST API experience.`,
    enhancedResponse: `<h5 class="font-bold mb-2">Image Processing API Documentation</h5>
<p class="mb-2 text-neutral-600 dark:text-neutral-400">Version: 1.0.0</p>

<h6 class="font-bold mt-4 mb-1">1. Introduction</h6>
<p class="mb-2">The Image Processing API provides powerful, on-demand image manipulation capabilities through a simple RESTful interface. This service allows you to dynamically resize, convert, and apply filters to images without requiring complex image processing software.</p>
<p class="mb-2"><strong>Key Features:</strong></p>
<ul class="list-disc pl-5 mb-2">
  <li>Resize images while maintaining or changing aspect ratios</li>
  <li>Convert between formats (JPG, PNG, WebP, GIF, etc.)</li>
  <li>Apply filters and effects (grayscale, blur, sharpen, etc.)</li>
  <li>Optimize images for web delivery</li>
</ul>

<h6 class="font-bold mt-4 mb-1">2. Authentication</h6>
<p class="mb-2">All API requests require authentication using an API key.</p>
<div class="bg-neutral-100 dark:bg-neutral-800 p-3 rounded mb-2 font-mono text-xs">
  <p>curl -H "X-API-Key: your_api_key_here" https://api.imageprocessing.example/v1/images</p>
</div>
<p class="mb-2">You can obtain an API key from your account dashboard.</p>

<h6 class="font-bold mt-4 mb-1">3. Endpoints</h6>
<p class="mb-2"><strong>3.1 List Images</strong></p>
<div class="bg-neutral-100 dark:bg-neutral-800 p-2 rounded mb-2">
  <p class="font-bold">GET /v1/images</p>
</div>

<p class="text-xs italic mt-5">[Documentation continues with more detailed endpoint examples...]</p>`,
    keyImprovements: [
      "Added specific details about API functionality (resizing, conversion, filtering)",
      "Structured the documentation with clear sections",
      "Specified format (Markdown) and target audience",
      "Requested example code in multiple languages",
      "Included error handling and rate limit information"
    ]
  },
  {
    id: "creative-writing",
    title: "Generating Creative Content",
    originalPrompt: "Write a short story about time travel.",
    originalResponse: `<h5 class="font-bold mb-2">The Timekeeper</h5>
<p class="mb-2">John discovered the pocket watch in his grandfather's attic. It looked ordinary, but when he wound it, the world around him blurred. Suddenly, he was standing in the same house, but it was 1950.</p>
<p class="mb-2">He spent the day exploring the past, meeting his young grandparents, and seeing the town as it once was. When it was time to return, he simply wound the watch again.</p>
<p class="mb-2">Back in the present, John realized that while time travel was amazing, the true gift was understanding his family's history. He placed the watch carefully in a drawer, saving it for when he really needed it again.</p>`,
    enhancedPrompt: `Write a 500-word short story about time travel with these elements:
- Main character: A female quantum physicist in her 60s
- Setting: Tokyo in the year 2075, where climate change has drastically altered the cityscape
- Plot device: Time travel is possible but has unintended consequences on memory
- Theme: The ethical responsibility of scientists
- Style: Blend of hard sci-fi with philosophical elements, similar to Ted Chiang
- Structure: Non-linear narrative that mirrors the time travel experience
- End with a moral dilemma that remains unresolved

Use vivid sensory details and minimal dialogue.`,
    enhancedResponse: `<h5 class="font-bold mb-2">Memory Equations</h5>

<p class="mb-2">Dr. Naomi Tanaka stood on her laboratory balcony, watching seawater lap against the elevated foundations of Neo-Tokyo. At sixty-four, her weathered hands trembled slightly as they gripped the railing. Below, anti-flood barriers gleamed in the sunset, protecting the remaining city grid from what was once Tokyo Bay.</p>

<p class="mb-2">The quantum displacement device behind her hummed, a sound like the universe clearing its throat.</p>

<p class="mb-2">In 2075, time travel wasn't a fantasy—it was a mathematical certainty, a triumph of quantum mechanics over classical physics. But Dr. Tanaka alone understood its true cost.</p>

<h6 class="font-medium mt-3 mb-1">2091 (Future Timeline)</h6>

<p class="mb-2">The air tasted different here—metallic and artificial. Dr. Tanaka's older self, approaching eighty, navigated a Tokyo she barely recognized. The floods had finally claimed the lower districts. Humanity had adapted: hydroponic gardens cascaded down buildings; drone highways crisscrossed the sky.</p>

<p class="mb-2">She'd come to witness the consequences of her own discovery. Each temporal jump fragmented memory—not just her own, but the collective memory of humanity. History itself was becoming unstable.</p>

<h6 class="font-medium mt-3 mb-1">2052 (Past Timeline)</h6>

<p class="mb-2">Young Naomi, still in her early forties, unknowingly stood at the precipice of breakthrough. The quantum lab was underground then, before the seas rose. Dr. Tanaka watched her younger self work, unaware she was being observed.</p>

<p class="mb-2">She could stop it all with a word—prevent her discovery from entering the world. The timeline would shift, reset. Millions of altered memories would stabilize.</p>

<p class="mb-2">But she couldn't speak. Causality wouldn't allow it.</p>

<p class="text-xs italic mt-5">[The story continues with philosophical elements and concludes with the unresolved moral dilemma...]</p>`,
    keyImprovements: [
      "Created a specific protagonist with defined characteristics",
      "Established a rich, detailed setting",
      "Incorporated specific thematic elements",
      "Requested a particular writing style and structure",
      "Added constraints on story length and style",
      "Included sensory details requirement for more vivid writing"
    ]
  },
  {
    id: "data-analysis",
    title: "Analyzing Data Trends",
    originalPrompt: "Analyze this sales data for trends: Q1: $125K, Q2: $143K, Q3: $165K, Q4: $152K.",
    originalResponse: `<h5 class="font-bold mb-2">Sales Data Analysis</h5>
<p class="mb-2">Looking at your quarterly sales data:</p>
<ul class="list-disc pl-5 mb-2">
  <li>There is an upward trend from Q1 to Q3</li>
  <li>Sales peaked in Q3 at $165K</li>
  <li>There was a slight decline in Q4 to $152K</li>
  <li>Overall, the company showed growth for the year</li>
</ul>
<p class="mb-2">The data suggests seasonal variation with stronger performance in the middle of the year.</p>`,
    enhancedPrompt: `Analyze the following quarterly sales data for a retail business that sells seasonal outdoor equipment:

- Q1 2023: $125,000
- Q2 2023: $143,000
- Q3 2023: $165,000
- Q4 2023: $152,000

Please provide:
1. Key trends and patterns (including growth rates between quarters)
2. Possible factors influencing these patterns (seasonality, market conditions, etc.)
3. Comparative analysis against typical industry seasonal patterns for outdoor equipment
4. Three specific, data-driven recommendations for inventory planning and marketing strategy
5. Suggested KPIs to monitor in the coming year

Include relevant calculations and present one hypothetical visualization you would create with this data. Assume the business has been growing at 5-7% annually for the past three years.`,
    enhancedResponse: `<h5 class="font-bold mb-2">Retail Outdoor Equipment Sales Analysis: 2023</h5>

<h6 class="font-bold mt-4 mb-1">1. Key Trends and Patterns</h6>
<ul class="list-disc pl-5 mb-3">
  <li>Sequential quarterly growth rates:
    <ul class="list-disc pl-5 mt-1">
      <li>Q1 to Q2: 14.4% increase</li>
      <li>Q2 to Q3: 15.4% increase</li>
      <li>Q3 to Q4: 7.9% decrease</li>
    </ul>
  </li>
  <li>Overall growth from Q1 to Q4: 21.6%</li>
  <li>Annual total: $585,000</li>
  <li>Peak sales occurred in Q3, suggesting strong summer season performance</li>
  <li>Average quarterly sales: $146,250</li>
</ul>

<h6 class="font-bold mt-4 mb-1">2. Influencing Factors</h6>
<ul class="list-disc pl-5 mb-3">
  <li>Seasonality: The peak in Q3 aligns with summer outdoor activities season, when camping, hiking, and other outdoor equipment typically see highest demand</li>
  <li>The Q4 decline is less severe than typical outdoor retail (which often sees 15-20% drops from Q3 to Q4), suggesting effective holiday marketing or diversified product lines</li>
  <li>The strong Q2 growth may indicate successful spring marketing campaigns or early summer product launches</li>
</ul>

<div class="bg-neutral-100 dark:bg-neutral-800 p-3 rounded my-3">
  <p class="text-sm font-semibold mb-1">Hypothetical Visualization: Quarterly Sales with Seasonal Overlay</p>
  <p class="text-xs">A line chart showing the quarterly sales data with a secondary overlay of the typical industry seasonality pattern, highlighting where the business outperformed seasonal expectations (particularly in Q4).</p>
</div>

<p class="text-xs italic mt-5">[Analysis continues with industry comparison, recommendations, and KPIs...]</p>`,
    keyImprovements: [
      "Added specific business context (retail outdoor equipment)",
      "Requested detailed analysis including growth rates and calculations",
      "Asked for industry comparisons to benchmark performance",
      "Requested specific, actionable recommendations",
      "Specified the need for KPIs and visualization suggestions",
      "Included historical context (previous years' growth rates)"
    ]
  }
];
