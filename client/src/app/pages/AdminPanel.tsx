import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { TrendingUp, Calendar, Users, Building, Settings, LogOut, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { truncateText } from '../components/ui/utils';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { SettingsPage } from './SettingsPage';
import { useAuth } from '../hooks/AuthContext';

const API_BASE = '/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface GroomerProfile {
    id: string;
    display_name: string;
    bio?: string;
    specialties?: string;
    credentials?: string;
    is_public: boolean;
    user?: { id: string; email: string; photo?: { url?: string } };
    services: { id: string }[];
}

interface Booking {
    id: string;
    start_datetime: string;
    end_datetime: string;
    status: string;
    cancelled: boolean;
    dog: { name: string; breed?: string };
    service: { name: string; price: number };
    groomer_profile: { display_name: string };
    customer_profile: { first_name: string; last_name: string };
}

interface SalonInfo {
    id?: string;
    name?: string;
    tagline?: string;
    address?: string;
    phone?: string;
    email?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

type Tab = 'dashboard' | 'groomers' | 'bookings' | 'salon' | 'settings';

// ── Main Component ─────────────────────────────────────────────────────────

export function AdminPanel() {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    // data
    const [groomers, setGroomers] = useState<GroomerProfile[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [salonInfo, setSalonInfo] = useState<SalonInfo>({});
    const [loading, setLoading] = useState(true);

    // invite groomer modal
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [invitePassword, setInvitePassword] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [toastMsg, setToastMsg] = useState('');

    // salon form
    const [salonForm, setSalonForm] = useState<SalonInfo>({});
    const [salonSaving, setSalonSaving] = useState(false);
    const [salonSuccess, setSalonSuccess] = useState(false);

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // ── Fetch all ─────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [groomersRes, bookingsRes, salonRes] = await Promise.all([
                fetch(`${API_BASE}/groomer-profiles`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/salon-info`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (groomersRes.ok) setGroomers(await groomersRes.json());
            if (bookingsRes.ok) setBookings(await bookingsRes.json());
            if (salonRes.ok) {
                try {
                    const data = await salonRes.json();
                    const info = Array.isArray(data) ? data[0] : data;
                    if (info && info.id) { setSalonInfo(info); setSalonForm(info); }
                } catch {}
            }
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Create groomer ────────────────────────────────────────────────────────
    const handleInviteGroomer = async () => {
        if (!inviteEmail || !invitePassword) return;
        setInviteLoading(true);
        setInviteError('');
        try {
            // Step 1 – get an invitation token from the admin endpoint
            const inviteRes = await fetch(`${API_BASE}/auth/groomer/invite`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ email: inviteEmail }),
            });
            if (!inviteRes.ok) {
                const err = await inviteRes.json();
                setInviteError(err.error ?? 'Failed to generate invite');
                return;
            }
            const { token: inviteToken } = await inviteRes.json();

            // Step 2 – register the groomer immediately with the token and admin-set password
            const registerRes = await fetch(`${API_BASE}/auth/groomer/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: inviteToken,
                    password: invitePassword,
                }),
            });
            if (!registerRes.ok) {
                const err = await registerRes.json();
                setInviteError(err.error ?? 'Failed to register groomer');
                return;
            }

            setShowInviteModal(false);
            setInviteEmail('');
            setInvitePassword('');
            setToastMsg(`✅ Groomer account created for ${inviteEmail}`);
            setTimeout(() => setToastMsg(''), 4000);
            fetchAll();
        } catch (err: any) {
            setInviteError(err.message ?? 'Something went wrong');
        } finally {
            setInviteLoading(false);
        }
    };

    // ── Toggle groomer public visibility ──────────────────────────────────────
    const handleToggleGroomerPublic = async (groomer: GroomerProfile) => {
        try {
            await fetch(`${API_BASE}/groomer-profiles/${groomer.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ is_public: !groomer.is_public }),
            });
            setGroomers(prev => prev.map(g => g.id === groomer.id ? { ...g, is_public: !g.is_public } : g));
        } catch (err) {
            console.error('Toggle error:', err);
        }
    };

    // ── Remove groomer ────────────────────────────────────────────────────────
    const handleRemoveGroomer = async (groomer: GroomerProfile) => {
        if (!window.confirm(`Remove ${groomer.display_name}? This cannot be undone.`)) return;
        try {
            const url = groomer.user?.id
                ? `${API_BASE}/users/${groomer.user.id}`
                : `${API_BASE}/groomer-profiles/${groomer.id}`;
            await fetch(url, { method: 'DELETE', headers });
            setGroomers(prev => prev.filter(g => g.id !== groomer.id));
            setToastMsg('🗑️ Groomer removed');
            setTimeout(() => setToastMsg(''), 3000);
        } catch (err) {
            console.error('Remove error:', err);
        }
    };

    // ── Cancel booking ────────────────────────────────────────────────────────
    const handleCancelBooking = async (id: string) => {
        if (!window.confirm('Cancel this booking?')) return;
        try {
            await fetch(`${API_BASE}/bookings/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ cancelled: true, status: 'CANCELLED' }),
            });
            setBookings(prev => prev.map(b => b.id === id ? { ...b, cancelled: true, status: 'CANCELLED' } : b));
        } catch (err) {
            console.error('Cancel booking error:', err);
        }
    };

    // ── Save salon info ───────────────────────────────────────────────────────
    const handleSaveSalon = async () => {
        setSalonSaving(true);
        setSalonSuccess(false);
        try {
            if (salonInfo.id) {
                await fetch(`${API_BASE}/salon-info/${salonInfo.id}`, {
                    method: 'PUT', headers, body: JSON.stringify(salonForm),
                });
            } else {
                const res = await fetch(`${API_BASE}/salon-info`, {
                    method: 'POST', headers, body: JSON.stringify(salonForm),
                });
                setSalonInfo(await res.json());
            }
            setSalonSuccess(true);
            setTimeout(() => setSalonSuccess(false), 3000);
        } catch (err) {
            console.error('Salon save error:', err);
        } finally {
            setSalonSaving(false);
        }
    };

    // ── Derived stats ─────────────────────────────────────────────────────────
    const now = new Date();
    const todayBookings = bookings.filter(b =>
        !b.cancelled && b.status !== 'CANCELLED' &&
        new Date(b.start_datetime).toDateString() === now.toDateString()
    );
    const upcomingBookings = bookings.filter(b =>
        !b.cancelled && b.status !== 'CANCELLED' && new Date(b.start_datetime) >= now
    );
    const weekRevenue = bookings
        .filter(b => {
            const d = new Date(b.start_datetime);
            return !b.cancelled && b.status !== 'CANCELLED' &&
                d >= new Date(now.getTime() - 7 * 86400000) && d <= now;
        })
        .reduce((sum, b) => sum + b.service.price, 0);

    const navItems: { tab: Tab; label: string; icon: React.ReactNode }[] = [
        { tab: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={20} /> },
        { tab: 'groomers',  label: 'Groomers',  icon: <Users size={20} /> },
        { tab: 'bookings',  label: 'Bookings',  icon: <Calendar size={20} /> },
        { tab: 'salon',     label: 'Salon Info', icon: <Building size={20} /> },
        { tab: 'settings',  label: 'Settings',  icon: <Settings size={20} /> },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
                         style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>Loading admin panel…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: 'var(--color-surface)' }}>

            {/* ── Sidebar ── */}
            <aside className="hidden md:flex w-64 bg-white border-r border-[var(--color-border)] flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-[var(--color-border)]">
                    <Link
                        to="/"
                        className="text-2xl font-extrabold mb-1 text-left hover:opacity-80 transition-opacity"
                        style={{ fontFamily: 'var(--font-display)' }}
                        aria-label="Go to home"
                    >
                        Paw<span style={{ color: 'var(--color-primary)' }}>🐾</span>Book
                    </Link>
                    <Badge variant="primary" className="text-xs">Admin Panel</Badge>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    {navItems.map(({ tab, label, icon }) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-1 transition-all flex items-center gap-3 ${
                                activeTab === tab ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-primary-light)]'
                            }`}
                        >
                            {icon} {label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {user?.email?.charAt(0).toUpperCase() ?? 'A'}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold truncate">{user?.email ?? 'Admin'}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Administrator</div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-50 transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 p-4 md:p-8 overflow-auto pb-24 md:pb-8">

                {/* ── DASHBOARD ── */}
                {activeTab === 'dashboard' && (
                    <div>
                        <h1 className="font-extrabold mb-8" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>
                            Dashboard Overview
                        </h1>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <Card className="p-6">
                                <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--color-primary)' }}>{todayBookings.length}</div>
                                <div className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>Bookings Today</div>
                            </Card>
                            <Card className="p-6">
                                <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--color-accent)' }}>{groomers.filter(g => g.is_public).length}</div>
                                <div className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>Active Groomers</div>
                            </Card>
                            <Card className="p-6">
                                <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--color-success)' }}>${weekRevenue}</div>
                                <div className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>Revenue This Week</div>
                            </Card>
                            <Card className="p-6">
                                <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--color-warning)' }}>{upcomingBookings.length}</div>
                                <div className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>Upcoming</div>
                            </Card>
                        </div>

                        <h2 className="font-extrabold mb-4" style={{ fontSize: '20px' }}>Recent Bookings</h2>
                        <Card className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                                    <th className="text-left p-4 font-extrabold">Customer</th>
                                    <th className="text-left p-4 font-extrabold">Dog</th>
                                    <th className="text-left p-4 font-extrabold">Groomer</th>
                                    <th className="text-left p-4 font-extrabold">Service</th>
                                    <th className="text-left p-4 font-extrabold">Date / Time</th>
                                    <th className="text-left p-4 font-extrabold">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookings.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>No bookings yet.</td></tr>
                                ) : (
                                    [...bookings]
                                        .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())
                                        .slice(0, 10)
                                        .map(b => (
                                            <tr key={b.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary-light)] transition-colors">
                                                <td className="p-4 font-bold">{b.customer_profile?.first_name} {b.customer_profile?.last_name}</td>
                                                <td className="p-4">{truncateText(b.dog.name, 21)}</td>
                                                <td className="p-4">{b.groomer_profile.display_name}</td>
                                                <td className="p-4">{b.service.name} · <span style={{ color: 'var(--color-primary)' }}>${b.service.price}</span></td>
                                                <td className="p-4 text-sm">{formatDate(b.start_datetime)}<br />{formatTime(b.start_datetime)}</td>
                                                <td className="p-4">
                                                    <Badge variant={b.cancelled || b.status === 'CANCELLED' ? 'error' : b.status === 'COMPLETED' ? 'success' : b.status === 'CONFIRMED' ? 'success' : 'primary'}>
                                                        {b.cancelled ? 'Cancelled' : b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                )}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                )}

                {/* ── GROOMERS ── */}
                {activeTab === 'groomers' && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="font-extrabold" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>Manage Groomers</h1>
                            <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
                                <Plus size={16} className="inline mr-1" /> Add Groomer
                            </Button>
                        </div>

                        <Card className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                                    <th className="text-left p-4 font-extrabold">Photo</th>
                                    <th className="text-left p-4 font-extrabold">Name</th>
                                    <th className="text-left p-4 font-extrabold">Email</th>
                                    <th className="text-left p-4 font-extrabold">Public</th>
                                    <th className="text-left p-4 font-extrabold">Services</th>
                                    <th className="text-left p-4 font-extrabold">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {groomers.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>No groomers yet.</td></tr>
                                ) : (
                                    groomers.map(groomer => (
                                        <tr key={groomer.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary-light)] transition-colors">
                                            <td className="p-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold"
                                                     style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                                    {groomer.user?.photo?.url
                                                        ? <ImageWithFallback src={groomer.user.photo.url} alt={groomer.display_name} className="w-full h-full object-cover" />
                                                        : groomer.display_name.charAt(0).toUpperCase()
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold">{groomer.display_name}</td>
                                            <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>{groomer.user?.email ?? '—'}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleToggleGroomerPublic(groomer)}
                                                    className={`w-11 h-6 rounded-full relative transition-colors ${groomer.is_public ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${groomer.is_public ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            </td>
                                            <td className="p-4">{groomer.services.length} service{groomer.services.length !== 1 ? 's' : ''}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleRemoveGroomer(groomer)}
                                                    className="font-bold text-sm hover:underline"
                                                    style={{ color: 'var(--color-error)' }}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                )}

                {/* ── BOOKINGS ── */}
                {activeTab === 'bookings' && (
                    <div>
                        <h1 className="font-extrabold mb-8" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>All Bookings</h1>
                        <Card className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                                    <th className="text-left p-4 font-extrabold">Customer</th>
                                    <th className="text-left p-4 font-extrabold">Dog</th>
                                    <th className="text-left p-4 font-extrabold">Groomer</th>
                                    <th className="text-left p-4 font-extrabold">Service</th>
                                    <th className="text-left p-4 font-extrabold">Date / Time</th>
                                    <th className="text-left p-4 font-extrabold">Status</th>
                                    <th className="text-left p-4 font-extrabold">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookings.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>No bookings yet.</td></tr>
                                ) : (
                                    [...bookings]
                                        .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())
                                        .map(b => (
                                            <tr key={b.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary-light)] transition-colors">
                                                <td className="p-4 font-bold">{b.customer_profile?.first_name} {b.customer_profile?.last_name}</td>
                                                <td className="p-4">{truncateText(b.dog.name, 21)}</td>
                                                <td className="p-4">{b.groomer_profile.display_name}</td>
                                                <td className="p-4">{b.service.name} · <span style={{ color: 'var(--color-primary)' }}>${b.service.price}</span></td>
                                                <td className="p-4 text-sm">{formatDate(b.start_datetime)}<br />{formatTime(b.start_datetime)}</td>
                                                <td className="p-4">
                                                    <Badge variant={b.cancelled || b.status === 'CANCELLED' ? 'error' : b.status === 'COMPLETED' ? 'success' : b.status === 'CONFIRMED' ? 'success' : 'primary'}>
                                                        {b.cancelled ? 'Cancelled' : b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    {!b.cancelled && b.status !== 'CANCELLED' && new Date(b.start_datetime) > now && (
                                                        <button
                                                            className="text-sm font-bold hover:underline"
                                                            style={{ color: 'var(--color-error)' }}
                                                            onClick={() => handleCancelBooking(b.id)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                )}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                )}

                {/* ── SALON INFO ── */}
                {activeTab === 'salon' && (
                    <div>
                        <h1 className="font-extrabold mb-8" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>Salon Information</h1>

                        <Card className="p-8 mb-6">
                            <h3 className="font-extrabold mb-6" style={{ fontSize: '18px' }}>Salon Identity</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-bold mb-2">Salon Name</label>
                                    <input
                                        value={salonForm.name ?? ''}
                                        onChange={e => setSalonForm({ ...salonForm, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        placeholder="PawBook Grooming"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2">Tagline</label>
                                    <textarea
                                        value={salonForm.tagline ?? ''}
                                        onChange={e => setSalonForm({ ...salonForm, tagline: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] h-24 resize-none"
                                        placeholder="The best grooming experience for your furry friend"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 mb-6">
                            <h3 className="font-extrabold mb-6" style={{ fontSize: '18px' }}>Contact & Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-2">Address</label>
                                    <input
                                        value={salonForm.address ?? ''}
                                        onChange={e => setSalonForm({ ...salonForm, address: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        placeholder="123 Main Street"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2">Phone</label>
                                    <input
                                        value={salonForm.phone ?? ''}
                                        onChange={e => setSalonForm({ ...salonForm, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-bold mb-2">Email</label>
                                    <input
                                        value={salonForm.email ?? ''}
                                        onChange={e => setSalonForm({ ...salonForm, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                        placeholder="hello@pawbook.com"
                                    />
                                </div>
                            </div>
                        </Card>

                        <div className="flex items-center gap-4">
                            <Button variant="primary" size="md" onClick={handleSaveSalon} disabled={salonSaving}>
                                {salonSaving ? 'Saving…' : 'Save Changes'}
                            </Button>
                            {salonSuccess && <span className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>✓ Saved!</span>}
                        </div>
                    </div>
                )}

                {/* ── SETTINGS ── */}
                {activeTab === 'settings' && (
                    <div>
                        <h1 className="font-extrabold mb-8" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>Settings</h1>
                        <SettingsPage userType="admin" />
                    </div>
                )}
            </main>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] z-50">
                <div className="flex justify-around items-center py-2">
                    {navItems.map(({ tab, label, icon }) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${activeTab === tab ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                        >
                            {icon}
                            <span className="text-xs mt-1 font-bold">{label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* ── Invite Groomer Modal ── */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
                    <Card className="p-8 max-w-lg w-full" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 16px 64px rgba(0,0,0,0.14)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-extrabold" style={{ fontSize: '24px' }}>Add New Groomer</h3>
                            <button onClick={() => setShowInviteModal(false)}><X size={20} /></button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block font-bold mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    placeholder="groomer@example.com"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2">Password *</label>
                                <input
                                    type="password"
                                    value={invitePassword}
                                    onChange={e => setInvitePassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    placeholder="Set temporary password"
                                />
                            </div>
                        </div>
                        {inviteError && <p className="text-sm font-bold mb-4" style={{ color: 'var(--color-error)' }}>{inviteError}</p>}
                        <div className="flex gap-3">
                            <Button variant="ghost" size="md" onClick={() => setShowInviteModal(false)} className="flex-1">Cancel</Button>
                            <Button variant="primary" size="md" onClick={handleInviteGroomer} disabled={inviteLoading || !inviteEmail || !invitePassword} className="flex-1">
                                {inviteLoading ? 'Creating…' : 'Create Groomer'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* ── Toast ── */}
            {toastMsg && (
                <div className="fixed top-6 right-6 z-50">
                    <Card className="p-4 shadow-xl font-bold" style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                        {toastMsg}
                    </Card>
                </div>
            )}
        </div>
    );
}