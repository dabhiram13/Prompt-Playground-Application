import { generatePDF } from '@/lib/pdf';
import { trackEvent } from '@/lib/analytics';

export default function Footer() {
  const handleDownloadPDF = () => {
    generatePDF();
    trackEvent('download_pdf', 'document', 'footer_link');
  };

  return (
    <footer className="bg-neutral-800 dark:bg-neutral-900 text-neutral-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-secondary-light" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-white">Prompt Engineering Playbook</span>
            </div>
            <p className="text-neutral-400 mb-4">A comprehensive guide to crafting effective prompts for AI models. Updated regularly with the latest techniques and best practices.</p>
            <p className="text-neutral-500 text-sm">© {new Date().getFullYear()} Prompt Engineering Playbook. All rights reserved.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#introduction" className="text-neutral-400 hover:text-secondary-light">Introduction</a></li>
              <li><a href="#techniques" className="text-neutral-400 hover:text-secondary-light">Techniques</a></li>
              <li><a href="#examples" className="text-neutral-400 hover:text-secondary-light">Examples</a></li>
              <li><a href="#case-studies" className="text-neutral-400 hover:text-secondary-light">Case Studies</a></li>
              <li><a href="#feedback" className="text-neutral-400 hover:text-secondary-light">Feedback</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li><a href="https://github.com/your-repo" target="_blank" className="text-neutral-400 hover:text-secondary-light">GitHub Repository</a></li>
              <li><a href="#" onClick={handleDownloadPDF} className="text-neutral-400 hover:text-secondary-light pdf-download-button">Download PDF</a></li>
              <li><a href="https://github.com/your-repo/issues" target="_blank" className="text-neutral-400 hover:text-secondary-light">Report an Issue</a></li>
              <li><a href="https://github.com/your-repo/blob/main/CONTRIBUTING.md" target="_blank" className="text-neutral-400 hover:text-secondary-light">Contribute</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-secondary-light">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
