import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { isValidEmail, normalizeEmail } from '../lib/validation';

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!email.trim()) {
      setEmailError('This field is required');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizeEmail(email), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const role = data.user.role;
      if (role === 'ADMIN') navigate('/dashboard/admin');
      else if (role === 'GROOMER') navigate('/dashboard/groomer');
      else navigate('/dashboard/customer');

    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary-light)' }}>
        <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10">
          <div className="mb-8 text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Paw<span className="text-[var(--color-primary)]">🐾</span>Book
          </div>
          <p className="italic mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Your pup deserves the best
          </p>
          <div className="w-full max-w-md">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop"
              alt="Happy dog"
              className="w-full rounded-3xl shadow-lg"
            />
          </div>
        </div>
        {/* Decorative blob */}
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ backgroundColor: 'var(--color-accent)' }} />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-block px-8 py-4 rounded-3xl mb-4" style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <div className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
                Paw<span className="text-[var(--color-primary)]">🐾</span>Book
              </div>
            </div>
          </div>

          <h1 className="font-extrabold mb-2" style={{ fontSize: '32px', fontFamily: 'var(--font-heading)' }}>
            Welcome back! 🐾
          </h1>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Log in to manage your bookings
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block font-bold mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${
                    emailError || error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
                  } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent`}
                  placeholder="your.email@example.com"
                />
              </div>
              {emailError && (
                <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-bold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 rounded-2xl border ${
                    error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
                  } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <a href="#" className="text-sm font-bold hover:underline" style={{ color: 'var(--color-primary)' }}>
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-text-primary)' }}>
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white" style={{ color: 'var(--color-text-secondary)' }}>
                  or
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                to="/signup"
                className="font-bold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Sign up as a customer
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
