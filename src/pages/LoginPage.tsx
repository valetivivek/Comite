import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { Button, Logo, SocialButtons, Divider, BackgroundDecoration, TermsAndConditions } from '@/components/ui/auth-form';

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 'user-1',
        username: formData.email.split('@')[0],
        email: formData.email,
        role: 'user',
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'dark' as const,
          viewMode: 'list' as const,
          itemsPerPage: 10,
          autoMarkAsRead: true,
          notifications: true,
        }
      };

      localStorage.setItem('manga-reader-user', JSON.stringify(mockUser));
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
    <div className="bg-zinc-950 min-h-screen py-12 sm:py-20 text-zinc-200 selection:bg-zinc-600 relative overflow-hidden">
      
      {/* Go Back button placed statically at the top left of the container */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="text-sm font-medium">Go back</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 mx-auto w-full max-w-xl p-4 mt-8"
      >
        <Logo />
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-white">Sign in to your account</h1>
          <p className="mt-2 text-zinc-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-manga-accent hover:underline">
              Create one
            </Link>
          </p>
        </div>
        
        <SocialButtons />
        <Divider />

        <form onSubmit={handleSubmit} className="mb-8 relative z-20">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-zinc-400"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@provider.com"
              className="w-full rounded-md border border-zinc-700 
              bg-zinc-900 px-3 py-2 text-zinc-200
              placeholder-zinc-500 
              ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-manga-accent focus:border-manga-accent"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="mb-1.5 flex items-end justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-400"
              >
                Password
              </label>
              <a href="#" className="text-sm text-manga-accent hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full rounded-md border border-zinc-700 
                bg-zinc-900 px-3 py-2 pr-10 text-zinc-200
                placeholder-zinc-500 
                ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-manga-accent focus:border-manga-accent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign in'}
          </Button>
        </form>

        <TermsAndConditions />
      </motion.div>
      <BackgroundDecoration />
    </div>
  );
};

export default LoginPage;
