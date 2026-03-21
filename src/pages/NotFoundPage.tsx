import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-manga-bg flex items-center justify-center px-4">
      <div className="card p-8 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-manga-text mb-2">404 - Page Not Found</h1>
        <p className="text-manga-muted mb-6">
          That page does not exist or is no longer available.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Browse Library</Link>
          <Link to="/popular" className="btn-secondary">Popular Titles</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
