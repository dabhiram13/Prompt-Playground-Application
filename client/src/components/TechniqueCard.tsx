import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Technique } from '@/data/techniques';
import { trackEvent } from '@/lib/analytics';

interface TechniqueCardProps {
  technique: Technique;
}

export default function TechniqueCard({ technique }: TechniqueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    trackEvent(
      isExpanded ? 'collapse_technique' : 'expand_technique',
      'content_interaction',
      technique.id
    );
  };

  return (
    <div id={technique.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
      <div className="cursor-pointer p-6" onClick={toggleExpand}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-primary dark:text-secondary-light">{technique.title}</h3>
          <ChevronDown 
            className={`text-neutral-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
          />
        </div>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{technique.summary}</p>
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-neutral-200 dark:border-neutral-700">
          <div className="prose dark:prose-invert max-w-none">
            <p>{technique.description}</p>
            
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-md my-4 font-mono text-sm">
              <p className="text-neutral-800 dark:text-neutral-300">{technique.example}</p>
            </div>
            
            <h4 className="text-lg font-medium mt-4 mb-2">When to Use It</h4>
            <ul className="list-disc pl-5 space-y-1">
              {technique.whenToUse.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            
            <h4 className="text-lg font-medium mt-4 mb-2">Tips for Success</h4>
            <ul className="list-disc pl-5 space-y-1">
              {technique.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
