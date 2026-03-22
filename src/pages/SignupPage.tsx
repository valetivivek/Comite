import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { Button, Logo, BackgroundDecoration, TermsAndConditions } from '@/components/ui/auth-form';
import { AssistedPasswordConfirmation } from '@/components/ui/assisted-password-confirmation';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: `user-${Date.now()}`,
        username: formData.username,
        email: formData.email,
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
      navigate('/');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen py-12 sm:py-20 text-zinc-200 selection:bg-zinc-600 relative overflow-hidden">
      
      {/* Go Back button */}
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
        className="relative z-10 mx-auto w-full max-w-xl p-4 mt-4"
      >
        <Logo />
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-white">Create Account</h1>
          <p className="mt-2 text-zinc-400">
            Join the ComiTe reading community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 relative z-20">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-zinc-400">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 placeholder-zinc-500 ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-manga-accent focus:border-manga-accent"
              required
              minLength={3}
              maxLength={32}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@provider.com"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 placeholder-zinc-500 ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-manga-accent focus:border-manga-accent"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-400">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 pr-10 text-zinc-200 placeholder-zinc-500 ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-manga-accent focus:border-manga-accent"
                required
                minLength={6}
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

          <div className="mb-8">
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-zinc-400">
              Confirm Password
            </label>
            <AssistedPasswordConfirmation
              password={formData.password}
              confirmPassword={formData.confirmPassword}
              onChange={(val) => setFormData(prev => ({ ...prev, confirmPassword: val }))}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-manga-accent hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>

        <TermsAndConditions />
      </motion.div>
      <BackgroundDecoration />
    </div>
  );
};

export default SignupPage;
