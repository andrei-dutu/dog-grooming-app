import { Link, useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './ImageWithFallback';
import { useAuth } from '../hooks/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardPath = user?.role === 'ADMIN'
    ? '/dashboard/admin'
    : user?.role === 'GROOMER'
      ? '/dashboard/groomer'
      : '/dashboard/customer';

  const avatarUrl = user?.photo?.url || 'https://via.placeholder.com/150';
  const avatarLabel = user?.email || 'Account';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            Paw<span className="text-[var(--color-primary)]">🐾</span>Book
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-bold text-[var(--color-text-secondary)]">
          <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
          <Link to="/services" className="hover:text-[var(--color-primary)] transition-colors">Services</Link>
          <Link to="/groomers" className="hover:text-[var(--color-primary)] transition-colors">Our Groomers</Link>
          <Link to="/gallery" className="hover:text-[var(--color-primary)] transition-colors">Gallery</Link>
          <Link to="/about" className="hover:text-[var(--color-primary)] transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => navigate(dashboardPath)}
                className="w-11 h-11 rounded-full overflow-hidden border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                aria-label="Go to dashboard"
                title={avatarLabel}
              >
                <ImageWithFallback
                  src={avatarUrl}
                  alt={avatarLabel}
                  className="w-full h-full object-cover"
                />
              </button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <span className="hidden sm:inline-flex items-center gap-2">
                  <LogOut size={16} />
                  Log Out
                </span>
                <span className="sm:hidden inline-flex items-center gap-2">
                  <LogOut size={16} />
                </span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Log In
            </Button>
          )}
          {isAuthenticated && user?.role === 'CLIENT' && (
            <Button variant="primary" size="sm" onClick={() => navigate('/booking')}>
              Book Now
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
