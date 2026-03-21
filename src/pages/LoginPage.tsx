import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('manga-reader-user');
    if (!stored) return;

    const params = new URLSearchParams(location.search);
    const returnTo = params.get('returnTo');
    navigate(returnTo ? decodeURIComponent(returnTo) : '/dashboard', { replace: true });
  }, [location.search, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser = {
        id: 'user-1',
        username: formData.email.split('@')[0],
        email: formData.email,
        role: 'user',
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'dark' as const,
          viewMode: 'list' as const, // Default to list view
          itemsPerPage: 10,
          autoMarkAsRead: true,
          notifications: true,
        }
      };

      localStorage.setItem('manga-reader-user', JSON.stringify(mockUser));
      // Elevate to admin if email is in allowlist
      try {
        const allow = localStorage.getItem('comite-admin-emails');
        const list = allow ? (JSON.parse(allow) as string[]) : ['ultimategamervivek@gmail.com'];
        if (list.includes(mockUser.email)) {
          localStorage.setItem('manga-reader-user', JSON.stringify({ ...mockUser, role: 'admin' }));
        }
      } catch {
        localStorage.removeItem('comite-admin-emails');
      }
      const params = new URLSearchParams(location.search);
      const returnTo = params.get('returnTo');
      navigate(returnTo ? decodeURIComponent(returnTo) : '/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-manga-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-manga-text mb-2">Welcome Back</h1>
            <p className="text-manga-muted">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="theme-danger-surface theme-danger-border rounded-lg border p-3" role="alert" aria-live="polite">
                <p className="theme-danger-text-strong text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-manga-text mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter your email"
                autoComplete="email"
                maxLength={120}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-manga-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input pr-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-manga-muted hover:text-manga-text transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-manga-muted text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-manga-accent hover:brightness-110 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-manga-muted hover:text-manga-text text-sm transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
