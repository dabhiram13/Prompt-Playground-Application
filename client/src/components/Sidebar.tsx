import { useEffect, useState } from 'react';

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState('introduction');

  const handleScroll = () => {
    const sections = ['introduction', 'techniques', 'examples', 'case-studies', 'feedback'];
    
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section);
          break;
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <aside className="hidden lg:block lg:w-64 xl:w-72 pr-6 sticky top-28 self-start h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold mb-2">Table of Contents</h2>
        <ul className="space-y-2">
          <li>
            <a 
              href="#introduction" 
              className={`${activeSection === 'introduction' ? 'text-primary dark:text-secondary-light font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light'}`}
            >
              Introduction
            </a>
          </li>
          <li>
            <a 
              href="#techniques" 
              className={`${activeSection === 'techniques' ? 'text-primary dark:text-secondary-light font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light'}`}
            >
              Techniques
            </a>
            <ul className="ml-4 mt-1 space-y-1">
              <li>
                <a 
                  href="#zero-shot" 
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light text-sm"
                >
                  Zero-Shot Prompting
                </a>
              </li>
              <li>
                <a 
                  href="#few-shot" 
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light text-sm"
                >
                  Few-Shot Examples
                </a>
              </li>
              <li>
                <a 
                  href="#cot" 
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light text-sm"
                >
                  Chain of Thought
                </a>
              </li>
              <li>
                <a 
                  href="#refinement" 
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light text-sm"
                >
                  Iterative Refinement
                </a>
              </li>
              <li>
                <a 
                  href="#more-techniques" 
                  className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light text-sm"
                >
                  More Techniques...
                </a>
              </li>
            </ul>
          </li>
          <li>
            <a 
              href="#examples" 
              className={`${activeSection === 'examples' ? 'text-primary dark:text-secondary-light font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light'}`}
            >
              Step-by-Step Examples
            </a>
          </li>
          <li>
            <a 
              href="#case-studies" 
              className={`${activeSection === 'case-studies' ? 'text-primary dark:text-secondary-light font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light'}`}
            >
              Case Studies
            </a>
          </li>
          <li>
            <a 
              href="#feedback" 
              className={`${activeSection === 'feedback' ? 'text-primary dark:text-secondary-light font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light'}`}
            >
              Feedback
            </a>
          </li>
        </ul>
      </div>
      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
        <ul className="space-y-2">
          <li>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('.pdf-download-button')?.dispatchEvent(
                  new MouseEvent('click', { bubbles: true })
                );
              }}
              className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light"
            >
              Download PDF
            </a>
          </li>
          <li>
            <a 
              href="https://github.com/your-repo" 
              target="_blank" 
              className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light"
            >
              GitHub Repository
            </a>
          </li>
          <li>
            <a 
              href="#contribute" 
              className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-secondary-light"
            >
              How to Contribute
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
