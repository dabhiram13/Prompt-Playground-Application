import { useState } from 'react';
import { Link } from 'wouter';
import { useTheme } from './ThemeProvider';
import SearchBox from './SearchBox';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, FileDown, BookOpen } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center mr-8 cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary dark:bg-secondary-light">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-bold text-primary dark:text-secondary-light">Prompt Engineering Playbook</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 ml-6">
            <a href="#introduction" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium text-sm">Introduction</a>
            <a href="#techniques" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium text-sm">Techniques</a>
            <a href="#examples" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium text-sm">Examples</a>
            <a href="#case-studies" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium text-sm">Case Studies</a>
            <a href="#feedback" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light font-medium text-sm">Feedback</a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="relative hidden lg:block mr-2">
            <SearchBox />
          </div>
          
          {/* PDF Export */}
          <div className="group relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPDF}
              className="relative group flex items-center gap-1.5 h-9"
              aria-label="Download PDF"
            >
              <FileDown className="h-4 w-4 text-primary dark:text-secondary-light" />
              <span className="text-sm hidden md:inline">PDF</span>
              <span className="invisible group-hover:visible absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 rounded whitespace-nowrap">
                Download PDF
              </span>
            </Button>
          </div>
          
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-secondary-light" />
            ) : (
              <Moon className="h-4 w-4 text-primary" />
            )}
          </Button>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-9"
            onClick={toggleMobileMenu}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <nav className={`px-4 py-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
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
