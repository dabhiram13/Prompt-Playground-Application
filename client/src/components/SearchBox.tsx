import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { initSearch, performSearch, SearchResult } from '@/lib/lunr-search';
import { trackEvent } from '@/lib/analytics';

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchReady, setIsSearchReady] = useState(false);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const setupSearch = async () => {
      await initSearch();
      setIsSearchReady(true);
    };
    
    setupSearch();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (searchQuery.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }
    
    const searchResults = await performSearch(searchQuery);
    setResults(searchResults);
    setIsOpen(searchResults.length > 0);
    
    trackEvent('search', 'search_interaction', searchQuery, {
      result_count: searchResults.length,
    });
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    
    // Navigate to the section
    const element = document.getElementById(result.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Highlight the element temporarily
      element.classList.add('bg-primary-light/20');
      setTimeout(() => {
        element.classList.remove('bg-primary-light/20');
      }, 2000);
    }
    
    trackEvent('search_result_click', 'search_interaction', result.id, {
      search_query: searchQuery,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <form onSubmit={handleSearch} className="relative w-full">
        <PopoverTrigger asChild ref={popoverTriggerRef}>
          <Button className="p-0 h-auto w-full bg-transparent hover:bg-transparent" variant="ghost">
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search techniques..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 py-2 pl-10 pr-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary-light border-none"
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                onClick={() => {
                  if (searchQuery.trim() !== '') {
                    handleSearch();
                  }
                }}
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Search Results
              </div>
              <ul>
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {result.preview}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
              {isSearchReady 
                ? 'No results found. Try different keywords.' 
                : 'Loading search index...'}
            </div>
          )}
        </PopoverContent>
      </form>
    </Popover>
  );
}
