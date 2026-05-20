import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Clock, Scissors, ArrowLeft, Star } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/ImageWithFallback';

const API_BASE = '/api';

interface Service {
    id: string;
    name: string;
    description?: string;
    duration_minutes: number;
    price: number;
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

export function GroomerPublicProfile() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [groomer, setGroomer] = useState<Groomer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');

    useEffect(() => {
        if (!id) return;
        fetch(`${API_BASE}/groomer-profiles/${id}`)
            .then(r => {
                if (!r.ok) throw new Error('Groomer not found');
                return r.json();
            })
            .then((data: Groomer) => {
                setGroomer(data);
                const firstActive = data.services.find(s => s.is_active);
                if (firstActive) setSelectedServiceId(firstActive.id);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
                <Navbar />
                <div className="flex items-center justify-center py-40">
                    <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                         style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                </div>
            </div>
        );
    }

    if (error || !groomer) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
                <Navbar />
                <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="font-extrabold mb-4" style={{ fontSize: '24px' }}>{error || 'Groomer not found'}</h2>
                    <Button variant="primary" size="md" onClick={() => navigate('/groomers')}>Back to Groomers</Button>
                </div>
            </div>
        );
    }

    const avatarUrl = groomer.user?.photo?.url;
    const specialties = groomer.specialties?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
    const activeServices = groomer.services.filter(s => s.is_active);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
            <Navbar />

            {/* Hero */}
            <div className="relative h-[320px] mb-20">
                {/* Cover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-violet-500 to-[var(--color-accent)]">
                    <div className="absolute inset-0 opacity-10 text-[120px] flex items-center justify-around select-none overflow-hidden">
                        🐾🐾🐾🐾🐾
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="max-w-7xl mx-auto px-6 pb-6">
                        <button
                            onClick={() => navigate('/groomers')}
                            className="flex items-center gap-2 text-white/80 font-bold mb-4 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={18} /> All Groomers
                        </button>
                        <div className="flex items-end justify-between flex-wrap gap-4">
                            {/* Avatar & Name */}
                            <div className="flex items-end gap-5">
                                <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-xl bg-white">
                                    {avatarUrl ? (
                                        <ImageWithFallback src={avatarUrl} alt={groomer.display_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold"
                                             style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                            {groomer.display_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-white mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '32px', textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                                        {groomer.display_name}
                                    </h1>
                                    {groomer.credentials && <Badge variant="accent">{groomer.credentials}</Badge>}
                                </div>
                            </div>

                            {/* Stats card */}
                            <Card className="p-4 shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                    <Scissors size={16} style={{ color: 'var(--color-primary)' }} />
                                    <span className="font-bold text-sm">{activeServices.length} active service{activeServices.length !== 1 ? 's' : ''}</span>
                                </div>
                                <Badge variant="success" className="text-xs">✅ Taking new clients</Badge>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 pb-16">
                <div className="grid lg:grid-cols-[1fr_360px] gap-8">

                    {/* Left Column */}
                    <div className="space-y-8">

                        {/* About */}
                        <div>
                            <h2 className="font-extrabold mb-4" style={{ fontSize: '22px' }}>About</h2>
                            {groomer.bio ? (
                                <p style={{ lineHeight: '1.7', color: 'var(--color-text-primary)' }}>{groomer.bio}</p>
                            ) : (
                                <p style={{ color: 'var(--color-text-secondary)' }}>No bio provided yet.</p>
                            )}
                            {specialties.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {specialties.map((s, i) => (
                                        <Badge key={i} variant="primary">{s}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Services */}
                        <div>
                            <h2 className="font-extrabold mb-4" style={{ fontSize: '22px' }}>Services</h2>
                            {activeServices.length === 0 ? (
                                <Card className="p-6 text-center" style={{ color: 'var(--color-text-secondary)' }}>No active services yet.</Card>
                            ) : (
                                <div className="border-t border-[var(--color-border)]">
                                    {activeServices.map(service => (
                                        <div key={service.id} className="border-b border-[var(--color-border)] py-5 flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="font-bold mb-1">{service.name}</div>
                                                {service.description && (
                                                    <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{service.description}</div>
                                                )}
                                                <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                    <Clock size={13} /> {service.duration_minutes} min
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <div className="font-extrabold" style={{ color: 'var(--color-primary)', fontSize: '20px' }}>${service.price}</div>
                                                <Button variant="ghost" size="sm" onClick={() => { setSelectedServiceId(service.id); }}>
                                                    Select
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column — Sticky Booking Panel */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <Card className="p-6 shadow-lg">
                            <h3 className="font-extrabold mb-5" style={{ fontSize: '18px' }}>
                                Book with {groomer.display_name.split(' ')[0]}
                            </h3>

                            {activeServices.length === 0 ? (
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    This groomer has no active services yet. Check back soon!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-bold mb-2 text-sm">Select Service</label>
                                        <select
                                            value={selectedServiceId}
                                            onChange={e => setSelectedServiceId(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-bold"
                                        >
                                            <option value="">Choose a service…</option>
                                            {activeServices.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} — ${s.price} ({s.duration_minutes} min)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedServiceId && (() => {
                                        const svc = activeServices.find(s => s.id === selectedServiceId);
                                        if (!svc) return null;
                                        return (
                                            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                                                <div className="font-bold mb-1">{svc.name}</div>
                                                <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                    <span>{svc.duration_minutes} min</span>
                                                    <span className="font-extrabold" style={{ color: 'var(--color-primary)' }}>${svc.price}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        onClick={() => navigate(`/book/${groomer.id}`)}
                                        disabled={!selectedServiceId}
                                    >
                                        Check Availability →
                                    </Button>

                                    <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
                                        Free cancellation · No hidden fees
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}