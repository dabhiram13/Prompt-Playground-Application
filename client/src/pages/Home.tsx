import { useState } from 'react';
import Layout from '@/components/Layout';
import TechniqueCard from '@/components/TechniqueCard';
import ExampleCard from '@/components/ExampleCard';
import CaseStudyCard from '@/components/CaseStudyCard';
import { Button } from '@/components/ui/button';
import { techniques } from '@/data/techniques';
import { examples } from '@/data/examples';
import { caseStudies } from '@/data/caseStudies';
import { resources } from '@/data/resources';
import { generatePDF } from '@/lib/pdf';
import { trackEvent } from '@/lib/analytics';
import { ArrowRight, Github, FileDown, Book, Video, Wrench } from 'lucide-react';

export default function Home() {
  const [visibleTechniques, setVisibleTechniques] = useState(4);
  const [visibleExamples, setVisibleExamples] = useState(1);

  const loadMoreTechniques = () => {
    setVisibleTechniques(Math.min(visibleTechniques + 4, techniques.length));
    trackEvent('load_more_techniques', 'content_interaction', '', { 
      count: visibleTechniques + 4 
    });
  };

  const loadMoreExamples = () => {
    setVisibleExamples(Math.min(visibleExamples + 2, examples.length));
    trackEvent('load_more_examples', 'content_interaction', '', { 
      count: visibleExamples + 2 
    });
  };

  const handleDownloadPDF = () => {
    generatePDF();
    trackEvent('download_pdf', 'document', 'cta_button');
  };

  // Function to initialize Disqus when the comments section is visible
  const loadDisqus = () => {
    // Check if Disqus is already loaded
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: function() {
          this.page.identifier = 'prompt-engineering-playbook';
          this.page.url = window.location.href;
          this.page.title = 'Prompt Engineering Playbook';
        }
      });
      return;
    }
    
    // If Disqus isn't loaded yet, create the script
    const script = document.createElement('script');
    script.src = 'https://prompt-engineering-playbook.disqus.com/embed.js';
    script.setAttribute('data-timestamp', Date.now().toString());
    document.body.appendChild(script);
    
    trackEvent('load_disqus', 'social_interaction');
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="mb-12 bg-gradient-to-r from-primary-dark to-primary rounded-xl overflow-hidden shadow-lg">
        <div className="md:flex">
          <div className="p-8 md:w-3/5">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Prompt Engineering Playbook</h1>
            <p className="text-neutral-100 text-lg mb-6">A comprehensive guide to crafting, refining, and optimizing prompts for AI models. Perfect for beginners and experienced practitioners.</p>
            <a 
              href="#introduction" 
              className="inline-block px-6 py-3 bg-white text-primary font-semibold rounded-lg shadow-md hover:bg-neutral-100 transition duration-200"
              onClick={() => trackEvent('get_started_click', 'navigation')}
            >
              Get Started
            </a>
          </div>
          <div className="md:w-2/5 bg-primary-light">
            <img 
              src="https://images.unsplash.com/photo-1591696331111-ef9586a5b17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
              alt="Person interacting with AI interface" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section id="introduction" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary-light mb-6">Introduction to Prompt Engineering</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-4">Prompt engineering is the art and science of communicating effectively with AI models. By structuring your inputs carefully, you can achieve more accurate, relevant, and creative outputs from language models like GPT-4, Claude, or Llama.</p>
          
          <div className="bg-neutral-100 dark:bg-neutral-700 p-6 rounded-lg my-6">
            <h3 className="text-xl font-semibold mb-3">Why Prompt Engineering Matters</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-start mb-2">
                  <div className="bg-primary dark:bg-secondary-light rounded-full p-2 mr-3 text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" fillRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Better Precision</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">Get exactly what you need without unnecessary information.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary dark:bg-secondary-light rounded-full p-2 mr-3 text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" fillRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Enhanced Creativity</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">Unlock more imaginative and diverse outputs from AI models.</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start mb-2">
                  <div className="bg-primary dark:bg-secondary-light rounded-full p-2 mr-3 text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                      <path clipRule="evenodd" fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Consistency</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">Maintain reliable formats and styles across multiple interactions.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary dark:bg-secondary-light rounded-full p-2 mr-3 text-white">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path clipRule="evenodd" fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Reduced Errors</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">Minimize hallucinations and inaccuracies in model responses.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="my-8">
            <img 
              src="https://images.unsplash.com/photo-1534137667199-675a46e143f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=500" 
              alt="Knowledge sharing concept" 
              className="w-full h-auto rounded-lg shadow-md" 
            />
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-2">Effective prompt engineering bridges the gap between human intent and AI understanding</p>
          </div>
          
          <h3 className="text-xl font-semibold mb-3">How to Use This Playbook</h3>
          <p>This interactive guide is organized to help you quickly find the right techniques for your specific needs:</p>
          
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li><strong>Techniques:</strong> Browse our library of prompting methods, each with explanations and use cases.</li>
            <li><strong>Step-by-Step Examples:</strong> See real improvements with before/after comparisons.</li>
            <li><strong>Case Studies:</strong> Explore detailed scenarios where prompt engineering solved specific challenges.</li>
          </ul>
          
          <p>Whether you're new to working with AI or looking to refine your existing skills, this playbook will help you communicate more effectively with language models and achieve better results.</p>
        </div>
      </section>

      {/* Techniques Library */}
      <section id="techniques" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary-light mb-6">Prompt Engineering Techniques</h2>
        
        <div className="mb-6">
          <p className="mb-4">Below you'll find a collection of proven prompting techniques. Each can be expanded to reveal detailed explanations, examples, and use cases.</p>
          
          {/* Techniques Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {techniques.slice(0, visibleTechniques).map((technique) => (
              <TechniqueCard key={technique.id} technique={technique} />
            ))}
          </div>
          
          {visibleTechniques < techniques.length && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMoreTechniques}
                className="px-6 py-6 bg-primary dark:bg-secondary hover:bg-primary-dark dark:hover:bg-secondary-dark text-white font-medium rounded-lg transition duration-200"
              >
                Load More Techniques
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary-light mb-6">Step-by-Step Examples</h2>
        
        <p className="mb-6">See how prompt engineering techniques can transform ordinary prompts into powerful ones. Toggle the comparison view to see the differences highlighted.</p>
        
        {examples.slice(0, visibleExamples).map((example) => (
          <ExampleCard key={example.id} example={example} />
        ))}
        
        {visibleExamples < examples.length && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMoreExamples}
              className="px-6 py-6 bg-primary dark:bg-secondary hover:bg-primary-dark dark:hover:bg-secondary-dark text-white font-medium rounded-lg transition duration-200"
            >
              Load More Examples
            </Button>
          </div>
        )}
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary-light mb-6">Case Studies</h2>
        
        <p className="mb-6">Explore real-world applications of prompt engineering techniques that solved specific challenges.</p>
        
        {/* Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary-light mb-6">Additional Resources</h2>
        
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden border border-neutral-200 dark:border-neutral-700 p-6">
          {/* Resources flex container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resourceCategory, index) => (
              <div key={index}>
                <h3 className="font-semibold text-lg mb-3 flex items-center text-primary dark:text-secondary-light">
                  <span className="mr-2">
                    {resourceCategory.icon === 'book' && <Book className="h-5 w-5" />}
                    {resourceCategory.icon === 'video' && <Video className="h-5 w-5" />}
                    {resourceCategory.icon === 'tools' && <Wrench className="h-5 w-5" />}
                  </span> 
                  {resourceCategory.title}
                </h3>
                <ul className="space-y-2">
                  {resourceCategory.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <svg 
                        className="w-3 h-3 mt-1.5 mr-2 text-neutral-500 dark:text-neutral-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-secondary-light"
                        onClick={() => trackEvent('resource_click', 'external_link', item.title)}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section id="feedback" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-primary dark:text-secondary-light mb-6">Feedback & Community</h2>
        
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden border border-neutral-200 dark:border-neutral-700 p-6">
          <p className="mb-6">We're constantly improving this playbook based on community feedback and evolving best practices. Share your thoughts, experiences, or suggestions below.</p>
          
          {/* Disqus Comments */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg">
            <div className="text-center">
              <svg 
                className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
              </svg>
              <h3 className="text-lg font-medium mb-2">Community Discussion</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">Share your prompt engineering experiences and questions with others.</p>
              <Button 
                onClick={loadDisqus}
                className="px-4 py-2 bg-primary dark:bg-secondary hover:bg-primary-dark dark:hover:bg-secondary-dark text-white font-medium rounded-lg transition duration-200"
              >
                Load Comments
              </Button>
            </div>
            
            {/* Disqus will be loaded here */}
            <div id="disqus_thread" className="mt-6"></div>
          </div>
          
          {/* Other Feedback Methods */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center">
                <Github className="mr-2 h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                GitHub Issues
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Report bugs, suggest improvements, or contribute directly to the codebase.</p>
              <a 
                href="https://github.com/your-repo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary dark:text-secondary-light font-medium text-sm flex items-center hover:underline"
                onClick={() => trackEvent('github_click', 'external_link')}
              >
                Open an Issue
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center">
                <svg 
                  className="w-5 h-5 mr-2 text-neutral-700 dark:text-neutral-300" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                Email Feedback
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Send detailed feedback or questions directly to our team.</p>
              <a 
                href="mailto:feedback@example.com" 
                className="text-primary dark:text-secondary-light font-medium text-sm flex items-center hover:underline"
                onClick={() => trackEvent('email_click', 'external_link')}
              >
                feedback@example.com
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-primary to-primary-light dark:from-secondary-dark dark:to-secondary rounded-xl overflow-hidden shadow-lg">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Improve Your AI Prompts?</h2>
            <p className="text-neutral-100 mb-6 max-w-2xl mx-auto">Start applying these techniques in your daily interactions with AI. Download the full playbook for offline reference or contribute to make it even better.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-white text-primary font-semibold rounded-lg shadow-md hover:bg-neutral-100 transition duration-200 flex items-center justify-center"
              >
                <FileDown className="mr-2 h-5 w-5" />
                Download PDF Version
              </Button>
              <a 
                href="https://github.com/your-repo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-primary-dark dark:bg-secondary-dark text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition duration-200 flex items-center justify-center"
                onClick={() => trackEvent('github_repo_click', 'external_link')}
              >
                <Github className="mr-2 h-5 w-5" />
                Contribute on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
