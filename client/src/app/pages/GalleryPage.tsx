import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

type GalleryImage = {
  id: number;
  src: string;
  category: string;
  groomerName: string;
  dogName: string;
  date: string;
};

const galleryImages: GalleryImage[] = [
  { id: 1, src: 'https://i.imgur.com/akHTiHI.jpeg', category: 'Full Groom', groomerName: 'Sarah Johnson', dogName: 'Mickey', date: 'May 15, 2026' },
  { id: 2, src: 'https://images.unsplash.com/photo-1709777571247-39ad71a2d86e?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'Full Groom', groomerName: 'Mike Chen', dogName: 'Max', date: 'May 14, 2026' },
  { id: 3, src: 'https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'Bath & Brush', groomerName: 'Emma Davis', dogName: 'Luna', date: 'May 13, 2026' },
  { id: 4, src: 'https://images.unsplash.com/photo-1616032776175-77c09e280ad8?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'Puppies', groomerName: 'Sarah Johnson', dogName: 'Charlie', date: 'May 12, 2026' },
  { id: 5, src: 'https://plus.unsplash.com/premium_photo-1663012822996-ba7e04f3627a?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'Full Groom', groomerName: 'Alex Martinez', dogName: 'Daisy', date: 'May 11, 2026' },
  { id: 6, src: 'https://plus.unsplash.com/premium_photo-1661315433170-b5c1cb6e730b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', category: 'Nail Trim', groomerName: 'Lisa Wong', dogName: 'Rocky', date: 'May 10, 2026' },
];

const categories = ['All', 'Full Groom', 'Bath & Brush', 'Nail Trim', 'Puppies'];

function GalleryCard({ image, onClick }: { image: GalleryImage; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
      <div
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px',
            cursor: 'pointer',
            minHeight: '280px',
            boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.2s',
          }}
      >
        <img
            src={image.src}
            alt={image.dogName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '280px' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.25s',
          padding: '16px',
        }}>
          {/* Badge top left */}
          <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
            <Badge variant="accent">{image.category}</Badge>
          </div>

          {/* Zoom icon center */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          </div>

          {/* Groomer + dog name bottom left */}
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: 'white' }}>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{image.groomerName}</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>{image.dogName}</div>
          </div>
        </div>
      </div>
  );
}

export function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const filteredImages = selectedCategory === 'All'
      ? galleryImages
      : galleryImages.filter(img => img.category === selectedCategory);

  const closeLightbox = () => setLightboxImage(null);

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === lightboxImage.id);
    const newIndex = direction === 'next'
        ? (currentIndex + 1) % filteredImages.length
        : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    const next = filteredImages[newIndex];
    if (next) setLightboxImage(next);
  };

  return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface)' }}>
        <Navbar />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Home › Gallery
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', margin: '0 0 12px', color: 'var(--color-text-primary)' }}>
              Fresh Cuts & Happy Pups
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>
              Every photo is a proud moment straight from our groomers' hands
            </p>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '8px 4px 12px 4px', marginBottom: '32px' }}>
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      border: 'none',
                      fontSize: '15px',
                      fontFamily: 'var(--font-body)',
                      transition: 'all 0.2s',
                      backgroundColor: selectedCategory === category ? 'var(--color-primary)' : 'white',
                      color: selectedCategory === category ? 'white' : 'var(--color-text-primary)',
                      boxShadow: selectedCategory === category ? 'none' : '0 0 0 2px var(--color-border)',
                    }}
                >
                  {category}
                </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {filteredImages.map(image => (
                <GalleryCard key={image.id} image={image} onClick={() => setLightboxImage(image)} />
            ))}
          </div>

          {/* Load More */}
          <div style={{ textAlign: 'center' }}>
            <Button variant="ghost" size="lg">Load More Photos</Button>
          </div>
        </div>

        {/* Lightbox */}
        {lightboxImage && (
            <div
                onClick={closeLightbox}
                style={{
                  position: 'fixed', inset: 0, zIndex: 50,
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
                }}
            >
              <button onClick={closeLightbox} style={{ position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <X size={20} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={24} />
              </button>

              <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '100%' }}>
                <img src={lightboxImage.src} alt={lightboxImage.dogName} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '16px 16px 0 0' }} />
                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '0 0 16px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Badge variant="accent">{lightboxImage.category}</Badge>
                  <span style={{ fontWeight: 700 }}>{lightboxImage.groomerName}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>·</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{lightboxImage.date}</span>
                  <span style={{ color: 'var(--color-text-secondary)', marginLeft: 'auto', fontStyle: 'italic' }}>{lightboxImage.dogName}</span>
                </div>
              </div>
            </div>
        )}

        <Footer />
      </div>
  );
}