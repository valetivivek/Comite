const DMCAPage = () => {
  return (
    <div className="min-h-screen bg-manga-bg py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-manga-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-manga-text mb-6">DMCA Notice</h1>
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-manga-text mt-6 mb-3">Copyright Infringement Claims</h2>
            <p className="text-manga-text mb-4">
              If you believe that your copyrighted work has been used in a way that constitutes copyright infringement, 
              please provide the following information in writing to our designated DMCA agent:
            </p>
            
            <ul className="list-disc list-inside text-manga-text mb-4 space-y-2">
              <li>A physical or electronic signature of the copyright owner or authorized agent</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing and location on our site</li>
              <li>Your contact information (address, phone number, email)</li>
              <li>A statement that you have a good faith belief that use of the material is not authorized</li>
              <li>A statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
            </ul>

            <h2 className="text-xl font-semibold text-manga-text mt-6 mb-3">Contact Information</h2>
            <p className="text-manga-text mb-2">
              <strong>DMCA Agent:</strong> dmca@yourdomain.com
            </p>
            <p className="text-manga-text mb-4">
              Please allow up to 7 business days for a response to your DMCA notice.
            </p>

            <h2 className="text-xl font-semibold text-manga-text mt-6 mb-3">Counter-Notification</h2>
            <p className="text-manga-text mb-4">
              If you believe your content was removed in error, you may file a counter-notification. 
              Please include the same information as above, plus a statement that you consent to the jurisdiction 
              of the federal court in your district.
            </p>

            <p className="text-manga-muted text-sm mt-6">
              <strong>Note:</strong> This is a placeholder DMCA page. Please replace with your actual DMCA procedures and contact information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMCAPage;
