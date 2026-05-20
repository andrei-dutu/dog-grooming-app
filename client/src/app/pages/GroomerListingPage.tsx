import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Star, Clock, ChevronDown, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ImageWithFallback } from '../components/ImageWithFallback';

const API_BASE = '/api';

interface Service {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
    is_active: boolean;
}

interface Groomer {
    id: string;
    display_name: string;
    bio?: string;
    specialties?: string;
    credentials?: string;
    is_public: boolean;
    user?: { photo?: { url?: string } };
    services: Service[];
}

const SPECIALTY_OPTIONS = ['Anxious dogs', 'Large breeds', 'Doodles', 'Puppies', 'Small breeds', 'Seniors'];

export function GroomerListingPage() {
    const navigate = useNavigate();

    const [groomers, setGroomers] = useState<Groomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState('');
    const [filterAvailable, setFilterAvailable] = useState(false);
    const [specialtyOpen, setSpecialtyOpen] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/groomer-profiles/public`)
            .then(r => r.json())
            .then((data: Groomer[]) => setGroomers(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = groomers.filter(g => {
        const nameMatch = g.display_name.toLowerCase().includes(search.toLowerCase());
        const specMatch = filterSpecialty
            ? g.specialties?.toLowerCase().includes(filterSpecialty.toLowerCase())
            : true;
        return nameMatch && specMatch;
    });

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        Home › Our Groomers
                    </div>
                    <h1 className="font-extrabold mb-2" style={{ fontFamily: 'var(--font-heading)', fontSize: '36px' }}>
                        Find Your Pup's Perfect Match 🐶
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        All our groomers are certified, background-checked, and dog-obsessed.
                    </p>
                </div>

                {/* Search + Filter Bar */}
                <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-sm -mx-6 px-6 py-4 mb-8 border-y border-[var(--color-border)]">
                    <div className="flex gap-3 overflow-x-auto items-center">
                        {/* Search */}
                        <div className="relative flex-shrink-0">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search groomers…"
                                className="pl-9 pr-4 py-2 rounded-full border border-[var(--color-border)] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-48"
                            />
                        </div>

                        {/* Specialty dropdown */}
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] transition-colors whitespace-nowrap font-bold text-sm"
                                onClick={() => setSpecialtyOpen(o => !o)}
                            >
                                {filterSpecialty || 'Specialty'} <ChevronDown size={15} />
                            </button>
                            {specialtyOpen && (
                                <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] z-50 min-w-[180px] py-2">
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-[var(--color-primary-light)]"
                                        onClick={() => { setFilterSpecialty(''); setSpecialtyOpen(false); }}
                                    >
                                        All Specialties
                                    </button>
                                    {SPECIALTY_OPTIONS.map(s => (
                                        <button key={s} className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-[var(--color-primary-light)]"
                                                onClick={() => { setFilterSpecialty(s); setSpecialtyOpen(false); }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Clear filters */}
                        {(search || filterSpecialty) && (
                            <button
                                className="text-sm font-bold px-4 py-2 rounded-full hover:bg-[var(--color-primary-light)]"
                                style={{ color: 'var(--color-primary)' }}
                                onClick={() => { setSearch(''); setFilterSpecialty(''); }}
                            >
                                Clear ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200" />
                                <div className="p-6 pt-12 text-center">
                                    <div className="w-24 h-4 bg-gray-200 rounded mx-auto mb-2" />
                                    <div className="w-16 h-3 bg-gray-200 rounded mx-auto" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <Card className="p-12 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        <div className="text-5xl mb-4">🔍</div>
                        <p className="font-bold">No groomers match your search.</p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {filtered.map(groomer => {
                            const avatarUrl = groomer.user?.photo?.url;
                            const specialties = groomer.specialties
                                ? groomer.specialties.split(',').map(s => s.trim()).filter(Boolean)
                                : [];
                            const activeServices = groomer.services.filter(s => s.is_active);
                            const minPrice = activeServices.length > 0 ? Math.min(...activeServices.map(s => s.price)) : null;

                            return (
                                <Card key={groomer.id} hover className="overflow-hidden flex flex-col">
                                    {/* Cover */}
                                    <div className="relative h-44 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-accent)]">
                                        <div className="absolute inset-0 opacity-20 text-[80px] flex items-center justify-center select-none">🐾</div>
                                        {/* Avatar overlapping */}
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                                            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
                                                {avatarUrl ? (
                                                    <ImageWithFallback src={avatarUrl} alt={groomer.display_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl font-extrabold"
                                                         style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                                        {groomer.display_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-12 text-center flex-1 flex flex-col">
                                        <h3 className="font-extrabold mb-1 text-lg">{groomer.display_name}</h3>
                                        {groomer.credentials && (
                                            <Badge variant="primary" className="text-xs mb-3 mx-auto">{groomer.credentials}</Badge>
                                        )}

                                        {/* Specialties */}
                                        {specialties.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                                                {specialties.slice(0, 3).map((spec, i) => (
                                                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold"
                                                          style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-text-primary)' }}>
                            {spec}
                          </span>
                                                ))}
                                                {specialties.length > 3 && (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                                          style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-text-secondary)' }}>
                            +{specialties.length - 3}
                          </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Bio */}
                                        {groomer.bio && (
                                            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{groomer.bio}</p>
                                        )}

                                        {/* Services summary */}
                                        {activeServices.length > 0 && (
                                            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                                                {activeServices.slice(0, 3).map(s => s.name).join(' · ')}
                                                {activeServices.length > 3 && ` +${activeServices.length - 3} more`}
                                            </p>
                                        )}

                                        {/* Price */}
                                        {minPrice !== null && (
                                            <div className="mb-5 font-extrabold" style={{ color: 'var(--color-primary)', fontSize: '18px' }}>
                                                From ${minPrice}
                                            </div>
                                        )}

                                        {/* CTAs */}
                                        <div className="flex gap-2 mt-auto">
                                            <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate(`/groomers/${groomer.id}`)}>
                                                View Profile
                                            </Button>
                                            <Button variant="primary" size="sm" className="flex-1" onClick={() => navigate(`/book/${groomer.id}`)}>
                                                Book Now
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}