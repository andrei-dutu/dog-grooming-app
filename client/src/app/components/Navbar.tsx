import { Link, useNavigate } from 'react-router';
import { Button } from './ui/button';

export function Navbar() {
  const navigate = useNavigate();

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
          <Link to="/reviews" className="hover:text-[var(--color-primary)] transition-colors">Reviews</Link>
          <Link to="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Log In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/booking')}>
            Book Now
          </Button>
        </div>
      </div>
    </nav>
  );
}
