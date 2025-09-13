import { useEffect, useState } from 'react';

const LicensePage = () => {
  const [licenseText, setLicenseText] = useState('');

  useEffect(() => {
    // Fetch the LICENSE.txt content
    fetch('/LICENSE.txt')
      .then(response => response.text())
      .then(text => setLicenseText(text))
      .catch(error => {
        console.error('Error loading license:', error);
        setLicenseText('Error loading license text.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-manga-bg py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-manga-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-manga-text mb-6">ComiTe License</h1>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-manga-text text-sm leading-relaxed">
              {licenseText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicensePage;
