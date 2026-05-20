import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Shield, Star, Users } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/ImageWithFallback';

const values = [
  { icon: <Heart size={32} />, label: 'Dog-First Always', desc: 'Every decision we make puts your pup first' },
  { icon: <Shield size={32} />, label: 'No Surprises', desc: 'Transparent pricing and honest communication' },
  { icon: <Star size={32} />, label: 'Certified Professionals', desc: 'All groomers are certified and background-checked' },
  { icon: <Users size={32} />, label: "You're Family", desc: 'We treat every dog like our own' }
];

export function AboutPage() {
  const navigate = useNavigate();
  const [groomers, setGroomers] = useState<any[]>([]);
  const [loadingGroomers, setLoadingGroomers] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/groomer-profiles')
      .then((res) => res.json())
      .then((data) => {
        setGroomers(Array.isArray(data) ? data.slice(0, 3) : []);
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
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="mb-6" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '52px',
              lineHeight: '1.1'
            }}>
              We're Dog People, Through and Through 🐾
            </h1>
            <p className="mb-4" style={{ fontSize: '18px', lineHeight: '1.6' }}>
              PawBook started in 2023 with a simple mission: make grooming a joyful experience for every dog. We believe that grooming shouldn't be stressful — it should be a spa day your pup actually looks forward to.
            </p>
            <p className="mb-4" style={{ fontSize: '18px', lineHeight: '1.6' }}>
              Our team of certified groomers brings decades of combined experience, specializing in everything from anxious rescues to high-energy puppies. We're not just grooming experts — we're dog lovers who treat every pup like family.
            </p>
            <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
              Today, we're proud to serve over 1,200 happy dogs across San Francisco, with a 4.9-star average rating and a community that keeps coming back.
            </p>
          </div>

          <div className="relative" style={{ height: '480px' }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '48%',
              height: '420px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}>
              <ImageWithFallback
                  src="https://i.imgur.com/akHTiHI.jpeg"
                  alt="Happy dog"
                  className="w-full h-full object-cover"
              />
            </div>
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '48%',
              height: '420px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}>
              <ImageWithFallback
                  src="https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Groomed dog"
                  className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center font-extrabold mb-12" style={{ fontSize: '32px', fontFamily: 'var(--font-heading)' }}>
            Our Values
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <Card key={i} className="p-6 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                  <div style={{ color: 'var(--color-accent-dark)' }}>
                    {value.icon}
                  </div>
                </div>
                <h3 className="font-extrabold mb-2">{value.label}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {value.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center font-extrabold mb-12" style={{ fontSize: '32px', fontFamily: 'var(--font-heading)' }}>
            The hands behind every groom
          </h2>
          {loadingGroomers ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
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
                  const avatarUrl =
                      groomer.user?.photo?.url || groomer.avatar_url || 'https://via.placeholder.com/150';
                  const name = groomer.display_name || groomer.user?.email || 'Groomer';

                  return (
                      <Card key={groomer.id} className="p-6 text-center" hover>
                        <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                          <ImageWithFallback
                              src={avatarUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-extrabold mb-1">{name}</h3>
                        <Badge variant="primary" className="text-xs mb-3">{groomer.specialties}</Badge>
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

      {/* By the Numbers */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--color-primary-light)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="mb-2" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                color: 'var(--color-primary)'
              }}>
                9
              </div>
              <div>Groomers</div>
            </div>
            <div>
              <div className="mb-2" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                color: 'var(--color-primary)'
              }}>
                1,200+
              </div>
              <div>Happy Pups</div>
            </div>
            <div>
              <div className="mb-2" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                color: 'var(--color-primary)'
              }}>
                4.9 ★
              </div>
              <div>Average Rating</div>
            </div>
            <div>
              <div className="mb-2" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px',
                color: 'var(--color-primary)'
              }}>
                3
              </div>
              <div>Years Running</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="text-6xl">🐾 🐾 🐾 🐾 🐾</div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-white mb-8" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px'
          }}>
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
