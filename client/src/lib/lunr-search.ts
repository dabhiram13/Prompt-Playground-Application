import lunr from 'lunr';
import { techniques } from '@/data/techniques';
import { examples } from '@/data/examples';
import { caseStudies } from '@/data/caseStudies';

export interface SearchResult {
  id: string;
  type: 'technique' | 'example' | 'casestudy';
  title: string;
  preview: string;
}

// Default data indexed for search
const searchData: SearchResult[] = [
  ...techniques.map(t => ({
    id: t.id,
    type: 'technique' as const,
    title: t.title,
    preview: t.summary
  })),
  ...examples.map(e => ({
    id: e.id,
    type: 'example' as const,
    title: e.title,
    preview: e.originalPrompt.substring(0, 100) + '...'
  })),
  ...caseStudies.map(c => ({
    id: c.id,
    type: 'casestudy' as const,
    title: c.title,
    preview: c.summary
  }))
];

// Search index instance
let idx: lunr.Index;

/**
 * Initialize the search index
 */
export const initSearch = async (): Promise<void> => {
  // Build the lunr index
  idx = lunr(function() {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('preview');
    this.field('type');
    
    // Add documents to index
    searchData.forEach(doc => {
      this.add(doc);
    });
  });
  
  return Promise.resolve();
};

/**
 * Perform a search query
 */
export const performSearch = async (query: string): Promise<SearchResult[]> => {
  if (!idx) {
    await initSearch();
  }
  
  try {
    // Perform the search
    const results = idx.search(query);
    
    // Map results back to data
    return results
      .map(result => {
        const item = searchData.find(d => d.id === result.ref);
        return item;
      })
      .filter((item): item is SearchResult => item !== undefined);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};
