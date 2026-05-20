import { Link } from 'react-router-dom';

export function Footer() {
  return (
      <footer className="bg-[#1C1C1C] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4 text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
              Paw<span className="text-[var(--color-primary)]">🐾</span>Book
            </div>
            <p className="text-gray-400">
              The best grooming experience for your furry friend
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2 text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/services" className="hover:text-white transition-colors">Services</Link>
              <Link to="/groomers" className="hover:text-white transition-colors">Our Groomers</Link>
              <Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <div className="text-gray-400 flex flex-col gap-2">
              <p>hello@pawbook.com</p>
              <p>+40 753 897 777</p>
              <p>Str. Cobzarilor 26</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Hours</h4>
            <div className="text-gray-400 flex flex-col gap-2">
              <p>Mon-Fri: 8am - 6pm</p>
              <p>Saturday: 9am - 5pm</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </footer>
  );
}