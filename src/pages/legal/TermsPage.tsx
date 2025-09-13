import { useEffect, useState } from 'react';

const TermsPage = () => {
  const [termsText, setTermsText] = useState('');

  useEffect(() => {
    // Fetch the WEBSITE-TERMS.md content
    fetch('/WEBSITE-TERMS.md')
      .then(response => response.text())
      .then(text => setTermsText(text))
      .catch(error => {
        console.error('Error loading terms:', error);
        setTermsText('Error loading terms text.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-manga-bg py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-manga-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-manga-text mb-6">Terms of Use</h1>
          <div className="prose prose-invert max-w-none">
            <div 
              className="text-manga-text text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: termsText.replace(/\n/g, '<br>').replace(/# /g, '<h2 class="text-xl font-semibold text-manga-text mt-6 mb-3">').replace(/## /g, '<h3 class="text-lg font-semibold text-manga-text mt-4 mb-2">')
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
