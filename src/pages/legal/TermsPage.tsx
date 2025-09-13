const TermsPage = () => {
  return (
    <div className="min-h-screen bg-manga-bg py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-manga-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-manga-text mb-6">Terms of Use</h1>
          <div className="prose prose-invert max-w-none">
            <div className="text-manga-text text-sm leading-relaxed">
              <h2 className="text-xl font-semibold text-manga-text mt-6 mb-3">Proprietary UI and Templates</h2>
              <p className="mb-4">
                The user interface, templates, and visual design of ComiTe are proprietary and protected by copyright. 
                You may not copy, reuse, or derive from the UI layout, component structure, or visual template without 
                written permission from Vishnu Vivek Valeti.
              </p>
              
              <h2 className="text-xl font-semibold text-manga-text mt-6 mb-3">Prohibited Uses</h2>
              <p className="mb-4">The following activities are strictly prohibited:</p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Copying or reproducing the UI design or layout</li>
                <li>Creating derivative works based on the visual design</li>
                <li>Using templates or components in other projects</li>
                <li>Reverse engineering the application structure</li>
                <li>Training machine learning models on the code or UI</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-manga-text mt-6 mb-3">Contact</h2>
              <p className="mb-4">
                For legal inquiries or permission requests, contact: vivekvaleti7053@gmail.com
              </p>
              
              <h2 className="text-xl font-semibold text-manga-text mt-6 mb-3">Changes to Terms</h2>
              <p className="mb-4">
                These terms may be updated at any time. Continued use of the service constitutes acceptance of any changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
