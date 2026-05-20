import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Scissors, Heart, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ImageWithFallback } from '../components/ImageWithFallback';

export function HomePage() {
  const navigate = useNavigate();
  const [groomers, setGroomers] = useState<any[]>([]);
  const [loadingGroomers, setLoadingGroomers] = useState(true);

  useEffect(() => {
    // Fetch groomer profiles — server now includes the related `user` and user's `photo`.
    fetch('http://localhost:3001/api/groomer-profiles/public')
      .then((res) => res.json())
      .then((data) => {
        // take first 3 for the homepage carousel
        setGroomers(data.slice(0, 3));
        setLoadingGroomers(false);
      })
      .catch((err) => {
        console.error('Failed to fetch groomers:', err);
        setLoadingGroomers(false);
      });
  }, []);

  return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="mb-6" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 8vw, 72px)',
                lineHeight: '1.1',
                color: 'var(--color-text-primary)'
              }}>
                Get Your Pup's Groom On 🐾
              </h1>
              <p className="mb-8" style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}>
                Professional grooming services with certified, dog-obsessed groomers. No double bookings, instant confirmation, and a tail-wagging experience every time.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg" onClick={() => navigate('/groomers')}>
                  Book an Appointment
                </Button>
                <Button variant="ghost" size="lg" onClick={() => navigate('/groomers')}>
                  Meet Our Groomers
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 md:hidden">
                <Button variant="primary" size="md" onClick={() => navigate('/booking')} className="w-full">
                  Book an Appointment
                </Button>
                <Button variant="ghost" size="md" onClick={() => navigate('/groomers')} className="w-full">
                  Meet Our Groomers
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <div className="w-full aspect-square rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-lime-200">
                  <ImageWithFallback
                      src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop"
                      alt="Fluffy groomed dog"
                      className="w-full h-full object-cover"
                  />
                </div>
                <Card className="absolute top-8 right-0 p-4 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={16} fill="var(--color-warning)" stroke="var(--color-warning)" />
                    ))}
                  </div>
                  <span className="font-bold">4.9 / 200+ happy pups</span>
                </Card>
              </div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ backgroundColor: 'var(--color-primary)' }} />
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Star size={32} />, label: 'Dog-First Booking', desc: 'Built for dogs, designed for you' },
              { icon: <Scissors size={32} />, label: 'Verified Groomers', desc: 'Certified & background-checked' },
              { icon: <Heart size={32} />, label: 'No Double Bookings', desc: 'Your pup gets undivided attention' },
              { icon: <Shield size={32} />, label: 'Instant Confirmation', desc: 'Know your slot in 60 seconds' }
            ].map((item, i) => (
                <Card key={i} className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                    <div style={{ color: 'var(--color-accent-dark)' }}>
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="font-extrabold mb-2">{item.label}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                </Card>
            ))}
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center font-extrabold mb-12" style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontFamily: 'var(--font-heading)' }}>
              How We Groom
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Grooming', price: 45, desc: 'Full haircut and style for your pup', popular: false, img: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop' },
                { title: 'Bath & Brush', price: 35, desc: 'Deep clean with premium shampoo', popular: true, img: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=300&fit=crop' },
                { title: 'Full Groom Package', price: 65, desc: 'Complete spa experience for your dog', popular: false, img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop' }
              ].map((service, i) => (
                  <Card key={i} hover className="overflow-hidden">
                    <div className="relative h-48">
                      <ImageWithFallback src={service.img} alt={service.title} className="w-full h-full object-cover" />
                      {service.popular && (
                          <Badge variant="accent" className="absolute top-4 right-4">Most Popular</Badge>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-extrabold mb-2">{service.title}</h3>
                      <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>{service.desc}</p>
                      <div className="flex items-center justify-between">
                    <span className="font-extrabold" style={{ color: 'var(--color-primary)', fontSize: '24px' }}>
                      From ${service.price}
                    </span>
                        <button onClick={() => navigate('/booking')} className="font-bold" style={{ color: 'var(--color-primary)' }}>
                          Book Now →
                        </button>
                      </div>
                    </div>
                  </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Groomers */}
        <section className="py-20 px-6" style={{ backgroundColor: 'var(--color-primary-light)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="font-extrabold" style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontFamily: 'var(--font-heading)' }}>
                Meet the Team
              </h2>
              <button onClick={() => navigate('/groomers')} className="font-bold hidden md:block" style={{ color: 'var(--color-primary)' }}>
                See All →
              </button>
            </div>

            {loadingGroomers ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                      <Card key={i} className="p-6 text-center animate-pulse">
                        <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200" />
                        <div className="h-4 bg-gray-200 rounded mx-auto w-32 mb-2" />
                        <div className="h-3 bg-gray-200 rounded mx-auto w-20" />
                      </Card>
                  ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {groomers.map((groomer: any) => {
                    // try to read the avatar from the included user.photo.url (prisma Media.url)
                    const avatarUrl =
                      groomer.user?.photo?.url || groomer.avatar_url || "https://via.placeholder.com/150";
                    const name = groomer.display_name || groomer.user?.email || "Groomer";

                    return (
                      <Card key={groomer.id} className="p-6 text-center">
                        <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                          <ImageWithFallback
                            src={avatarUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-extrabold mb-1">{name}</h3>
                        <Badge variant="primary" className="text-xs mb-3">{groomer.specialties}</Badge>
                        {/*<div className="flex justify-center items-center gap-1 mb-4">*/}
                        {/*  <Star size={16} fill="var(--color-warning)" stroke="var(--color-warning)" />*/}
                        {/*  <span className="font-bold">{groomer.rating}</span>*/}
                        {/*</div>*/}
                        <Button variant="primary" size="sm" className="w-full" onClick={() => navigate('/groomers')}>
                          View Profile
                        </Button>
                      </Card>
                    );
                  })}
                </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 border-t-2 border-dashed" style={{ borderColor: 'var(--color-border)' }} />
              {[
                { num: 1, title: "Create your dog's profile", desc: "Tell us about your pup's needs", icon: '🐕' },
                { num: 2, title: 'Pick a groomer & service', desc: 'Choose the perfect match', icon: '✂️' },
                { num: 3, title: 'Confirm in 60 seconds', desc: 'Get instant confirmation', icon: '✨' }
              ].map((step, i) => (
                  <div key={i} className="text-center relative z-10">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-extrabold text-2xl" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-dark)' }}>
                      {step.num}
                    </div>
                    <div className="text-4xl mb-2">{step.icon}</div>
                    <h3 className="font-extrabold mb-2">{step.title}</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{step.desc}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA Banner */}
        <section className="py-20 px-6 relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="text-6xl">🐾 🐾 🐾 🐾 🐾</div>
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-white mb-8" style={{ fontFamily: 'var(--font-display)', fontSize: '48px' }}>
              Ready for the Best Groom Ever?
            </h2>
            <Button size="lg" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-dark)' }} onClick={() => navigate('/booking')}>
              Book Now
            </Button>
          </div>
        </section>

        <Footer />
      </div>
  );
}