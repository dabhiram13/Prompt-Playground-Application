import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Example } from '@/data/examples';
import { trackEvent } from '@/lib/analytics';

interface ExampleCardProps {
  example: Example;
}

export default function ExampleCard({ example }: ExampleCardProps) {
  const [showEnhanced, setShowEnhanced] = useState(false);

  const handleToggle = (checked: boolean) => {
    setShowEnhanced(checked);
    trackEvent(
      'toggle_example_view', 
      'content_interaction', 
      checked ? 'enhanced' : 'basic',
      { example_id: example.id }
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden border border-neutral-200 dark:border-neutral-700 mb-8">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-primary dark:text-secondary-light mb-3">{example.title}</h3>
        
        {/* Toggle Switch */}
        <div className="flex items-center mb-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400 mr-2">Basic</span>
          <Switch id={`toggle-${example.id}`} checked={showEnhanced} onCheckedChange={handleToggle} />
          <Label htmlFor={`toggle-${example.id}`} className="text-sm text-neutral-600 dark:text-neutral-400 ml-2">Enhanced</Label>
        </div>
        
        {/* Two Column Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Column */}
          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-neutral-700 dark:text-neutral-300">Original Prompt</h4>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded border border-neutral-200 dark:border-neutral-700 font-mono text-sm">
              <p className="text-neutral-800 dark:text-neutral-400">{example.originalPrompt}</p>
            </div>
            
            <h4 className="font-medium mt-4 mb-2 text-neutral-700 dark:text-neutral-300">AI Response</h4>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded border border-neutral-200 dark:border-neutral-700 text-sm">
              <div dangerouslySetInnerHTML={{ __html: example.originalResponse }} />
            </div>
          </div>
          
          {/* After Column */}
          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-neutral-700 dark:text-neutral-300">Enhanced Prompt</h4>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded border border-neutral-200 dark:border-neutral-700 font-mono text-sm">
              <p className="text-neutral-800 dark:text-neutral-400">{example.enhancedPrompt}</p>
            </div>
            
            <h4 className="font-medium mt-4 mb-2 text-neutral-700 dark:text-neutral-300">AI Response</h4>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded border border-neutral-200 dark:border-neutral-700 text-sm max-h-[360px] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: example.enhancedResponse }} />
            </div>
          </div>
        </div>
        
        {/* Key Improvements List */}
        <div className="mt-6 bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Key Improvements</h4>
          <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-neutral-300">
            {example.keyImprovements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
