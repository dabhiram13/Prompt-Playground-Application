import { CaseStudy } from '@/data/caseStudies';
import { trackEvent } from '@/lib/analytics';
import { ArrowRight } from 'lucide-react';

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export default function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const handleReadMore = () => {
    trackEvent('view_case_study', 'content_interaction', caseStudy.id);
    // For now, we'll just log the click since full case studies aren't implemented
    console.log(`Viewing case study: ${caseStudy.id}`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
      <div className="relative h-48">
        <img 
          src={caseStudy.image} 
          alt={caseStudy.imageAlt} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <h3 className="text-white font-bold text-xl p-4">{caseStudy.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-3 flex-wrap gap-2">
          {caseStudy.tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-primary-light/20 text-primary dark:bg-secondary/20 dark:text-secondary-light text-xs font-medium px-2.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">{caseStudy.summary}</p>
        <button 
          onClick={handleReadMore} 
          className="text-primary dark:text-secondary-light font-medium text-sm flex items-center hover:underline"
        >
          Read Full Case Study
          <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
