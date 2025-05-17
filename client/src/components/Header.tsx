import { useState } from 'react';
import { Link } from 'wouter';
import { useTheme } from './ThemeProvider';
import SearchBox from './SearchBox';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, FileDown } from 'lucide-react';
import { generatePDF } from '@/lib/pdf';
import { trackEvent } from '@/lib/analytics';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    trackEvent('toggle_theme', 'ui_interaction', newTheme);
  };

  const handleDownloadPDF = () => {
    generatePDF();
    trackEvent('download_pdf', 'document', 'header_button');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center mr-8 cursor-pointer">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-primary dark:text-secondary-light">Prompt Engineering Playbook</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a href="#introduction" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Introduction</a>
            <a href="#techniques" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Techniques</a>
            <a href="#examples" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Examples</a>
            <a href="#case-studies" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Case Studies</a>
            <a href="#feedback" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Feedback</a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <SearchBox />
          </div>
          
          {/* PDF Export */}
          <div className="group relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadPDF}
              className="relative group"
              aria-label="Download PDF"
            >
              <FileDown className="h-5 w-5 text-primary dark:text-secondary-light" />
              <span className="invisible group-hover:visible absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 rounded whitespace-nowrap">
                Download PDF
              </span>
            </Button>
          </div>
          
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-secondary-light" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </Button>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <nav className={`px-4 py-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col space-y-3">
          <a href="#introduction" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Introduction</a>
          <a href="#techniques" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Techniques</a>
          <a href="#examples" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Examples</a>
          <a href="#case-studies" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Case Studies</a>
          <a href="#feedback" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium">Feedback</a>
        </div>
        <div className="mt-4 relative">
          <SearchBox />
        </div>
      </nav>
    </header>
  );
}
