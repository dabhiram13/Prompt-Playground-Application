import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
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
          <div className="p-0 w-full" id="poda">
            <div className="relative" id="main">
              <div className="darkBorderBg"></div>
              <div className="white"></div>
              <div className="border"></div>
              <div className="glow"></div>
              <div id="pink-mask"></div>
              <div id="input-mask"></div>
              <Search id="search-icon" className="absolute left-3 top-[10px] h-4 w-4 text-neutral-400 z-10" />
              <input
                type="text"
                placeholder="Search techniques..."
                value={searchQuery}
                className="input"
                onChange={(e) => setSearchQuery(e.target.value)}
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
          </div>
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
