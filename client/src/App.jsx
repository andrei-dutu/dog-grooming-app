import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './app/pages/HomePage';
import {AboutPage} from "@/app/pages/AboutPage.tsx";
import {GalleryPage} from "@/app/pages/GalleryPage.tsx";

// Placeholder for pages not yet built
function ComingSoon({ page }) {
  return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'var(--color-surface)',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ fontSize: '64px' }}>🐾</div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '32px' }}>
          {page}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Coming soon...</p>
      </div>
  );
}

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<ComingSoon page="BookingFlow" />} />
          <Route path="/groomers" element={<ComingSoon page="Groomer Listing" />} />
          <Route path="/groomers/:id" element={<ComingSoon page="Groomer Profile" />} />
          <Route path="/services" element={<ComingSoon page="Services" />} />
          <Route path="/reviews" element={<ComingSoon page="Reviews" />} />
          <Route path="/login" element={<ComingSoon page="Login" />} />
          <Route path="/signup" element={<ComingSoon page="Sign Up" />} />
          <Route path="/dashboard" element={<ComingSoon page="Customer Dashboard" />} />
          <Route path="/groomer-dashboard" element={<ComingSoon page="Groomer Dashboard" />} />
          <Route path="/admin" element={<ComingSoon page="Admin Panel" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ComingSoon page="Contact" />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/settings" element={<ComingSoon page="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;