import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/ImageWithFallback';

export function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: '#FCA5A5' };
    if (password.length < 10) return { strength: 2, label: 'Fair', color: '#FDBA74' };
    if (password.length < 14) return { strength: 3, label: 'Good', color: '#FDE68A' };
    return { strength: 4, label: 'Strong', color: 'var(--color-accent)' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'This field is required';
    if (!formData.lastName) newErrors.lastName = 'This field is required';
    if (!formData.email) newErrors.email = 'This field is required';
    if (!formData.password) newErrors.password = 'This field is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'This field is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to continue';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (Object.keys(newErrors).length === 0) {
        setLoading(true);
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone || undefined,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            if (data.error?.toLowerCase().includes('email')) {
              setErrors({ email: data.error });
            } else {
              setErrors({ general: data.error || 'Registration failed' });
            }
            return;
          }

          setSuccess(true);
        } catch {
          setErrors({ general: 'Something went wrong. Please try again.' });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-success)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-extrabold mb-4" style={{ fontSize: '24px' }}>
            Welcome to PawBook! 🎉
          </h1>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Check your email to confirm your account
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/dashboard/customer')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary-light)' }}>
        <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10">
          <div className="mb-8 text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Paw<span className="text-[var(--color-primary)]">🐾</span>Book
          </div>
          <p className="italic mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Join thousands of happy pet parents
          </p>
          <div className="w-full max-w-md">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop"
              alt="Happy dog"
              className="w-full rounded-3xl shadow-lg"
            />
          </div>
        </div>
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
            Create Your Account 🐾
          </h1>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold" style={{ color: 'var(--color-primary)' }}>
              Log in →
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block font-bold mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${
                    errors.firstName ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
                  } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent`}
                  placeholder="John"
                />
              </div>
              {errors.firstName && <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block font-bold mb-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${
                    errors.lastName ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
                  } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent`}
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${
                    errors.email ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
                  } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold mb-2">
                Phone Number <span style={{ color: 'var(--color-text-secondary)' }}>(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-12 pr-12 py-3 rounded-2xl border ${
                    errors.password ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
                  } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent`}
                  placeholder="Create a strong password"
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
              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{
                          backgroundColor: i <= passwordStrength.strength ? passwordStrength.color : '#E5E7EB'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-bold mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-12 pr-12 py-3 rounded-2xl border ${
                    errors.confirmPassword ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
                  } focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className={`w-5 h-5 mt-0.5 rounded border-2 ${
                    errors.agreeToTerms ? 'border-[var(--color-error)]' : 'border-[var(--color-primary)]'
                  } checked:bg-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]`}
                />
                <span className="text-sm">
                  I agree to the{' '}
                  <a href="#" className="font-bold" style={{ color: 'var(--color-primary)' }}>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-bold" style={{ color: 'var(--color-primary)' }}>
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreeToTerms && <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.agreeToTerms}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Creating your account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
