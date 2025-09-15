import { Link } from 'react-router-dom';

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen bg-manga-bg flex items-center justify-center px-4">
      <div className="card p-8 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-manga-text mb-2">403 — Forbidden</h1>
        <p className="text-manga-muted mb-6">You don’t have permission to access this page.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/login" className="btn-secondary">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;


