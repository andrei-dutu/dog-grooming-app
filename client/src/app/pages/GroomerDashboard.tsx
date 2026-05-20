import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
    Calendar, Clock, Users, Settings, LogOut, Phone,
    AlertCircle, Scissors, Home, Plus, Pencil, Trash2, Eye, EyeOff, X, Check
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SettingsPage } from './SettingsPage';
import { useAuth } from '../hooks/AuthContext';
import { truncateText } from '../components/ui/utils';

const API_BASE = '/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface GroomerProfile {
    id: string;
    display_name: string;
    bio?: string;
    specialties?: string;
    credentials?: string;
    is_public: boolean;
}

interface Service {
    id: string;
    name: string;
    description?: string;
    duration_minutes: number;
    price: number;
    is_active: boolean;
}

interface Booking {
    id: string;
    start_datetime: string;
    end_datetime: string;
    status: string;
    cancelled: boolean;
    cancellation_reason?: string;
    dog: { id: string; name: string; breed?: string; weight_kg?: number; temperament?: string; notes?: string };
    service: { name: string; duration_minutes: number; price: number };
    customer_profile: { first_name: string; last_name: string; phone?: string };
}

interface WorkingHours {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

interface TimeBlock {
    id: string;
    start_datetime: string;
    end_datetime: string;
    reason?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function isToday(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const temperamentVariant: Record<string, 'success' | 'accent' | 'warning' | 'error' | 'primary'> = {
    calm: 'success',
    playful: 'accent',
    anxious: 'warning',
    energetic: 'accent',
    aggressive: 'error',
    shy: 'primary',
};

// ── Sub-components ─────────────────────────────────────────────────────────

function AppointmentCard({ apt, onCancel }: { apt: Booking; onCancel: () => void }) {
    const now = new Date();
    const isPast = new Date(apt.start_datetime) < now || apt.cancelled || apt.status === 'CANCELLED';
    const hoursUntil = (new Date(apt.start_datetime).getTime() - now.getTime()) / 3_600_000;
    const canCancel = !isPast && hoursUntil >= 24;
    const temperaments = apt.dog.temperament?.split(',').map(t => t.trim()) ?? [];

    // truncate name and breed for listing
    const dogNameDisplay = truncateText(apt.dog.name, 21);
    const breedDisplay = apt.dog.breed ? truncateText(apt.dog.breed, 18) : undefined;

    return (
        <Card className="flex-1 p-6 border-l-[5px]" style={{ borderLeftColor: isPast ? 'var(--color-border)' : 'var(--color-primary)' }}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="primary" className="text-xs">
                        {formatTime(apt.start_datetime)} – {formatTime(apt.end_datetime)}
                    </Badge>
                    <span className="font-extrabold">{apt.service.name}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
            ${apt.service.price}
          </span>
                </div>
                <div className="flex items-center gap-2">
                    {apt.cancelled || apt.status === 'CANCELLED' ? (
                        <Badge variant="error">Cancelled</Badge>
                    ) : apt.status === 'COMPLETED' ? (
                        <Badge variant="success">Completed</Badge>
                    ) : apt.status === 'CONFIRMED' ? (
                        <Badge variant="success">Confirmed</Badge>
                    ) : (
                        <Badge variant="primary">Pending</Badge>
                    )}
                </div>
            </div>

            <div className="flex gap-6 flex-wrap">
                {/* Dog Info */}
                <div className="flex items-start gap-4">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                        🐶
                    </div>
                    <div>
                        <div className="font-extrabold mb-1">{dogNameDisplay}</div>
                        <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {[breedDisplay, apt.dog.weight_kg ? `${apt.dog.weight_kg} kg` : null].filter(Boolean).join(' · ')}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {temperaments.map(t => (
                                <Badge key={t} variant={temperamentVariant[t.toLowerCase()] ?? 'primary'} className="text-xs capitalize">
                                    {t}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Owner Info */}
                <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={15} style={{ color: 'var(--color-primary)' }} />
                        <span className="font-bold">{apt.customer_profile.first_name} {apt.customer_profile.last_name}</span>
                    </div>
                    {apt.customer_profile.phone && (
                        <div className="flex items-center gap-2 mb-3">
                            <Phone size={15} style={{ color: 'var(--color-primary)' }} />
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{apt.customer_profile.phone}</span>
                        </div>
                    )}
                    {apt.dog.notes && (
                        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: '#FEF9C3' }}>
                            <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: '#854D0E' }} />
                            <p className="text-sm italic" style={{ color: '#854D0E' }}>{apt.dog.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {!isPast && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex gap-2">
                    <button
                        onClick={canCancel ? onCancel : undefined}
                        className="text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                        style={{
                            color: canCancel ? 'var(--color-error)' : 'var(--color-text-secondary)',
                            cursor: canCancel ? 'pointer' : 'not-allowed',
                            opacity: canCancel ? 1 : 0.5,
                        }}
                        title={canCancel ? undefined : 'Cancellations must be made at least 24 hours in advance'}
                    >
                        Cancel Appointment
                    </button>
                </div>
            )}
        </Card>
    );
}

// ── Service Form Modal ─────────────────────────────────────────────────────

interface ServiceFormProps {
    service: Partial<Service> | null;
    onSave: (data: Partial<Service>) => Promise<void>;
    onClose: () => void;
    saving: boolean;
}

function ServiceFormModal({ service, onSave, onClose, saving }: ServiceFormProps) {
    const [form, setForm] = useState({
        name: service?.name ?? '',
        description: service?.description ?? '',
        duration_minutes: service?.duration_minutes ?? 60,
        price: service?.price ?? 0,
        is_active: service?.is_active ?? true,
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <Card className="p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="font-extrabold mb-6" style={{ fontSize: '20px' }}>
                    {service?.id ? 'Edit Service' : 'Add Service'}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block font-bold mb-2">Service Name</label>
                        <input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            placeholder="e.g. Full Groom"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2">Description (optional)</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                            rows={2}
                            placeholder="Brief description..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold mb-2">Duration (min)</label>
                            <input
                                type="number"
                                value={form.duration_minutes}
                                onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                min={5}
                                step={5}
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-2">Price ($)</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                min={0}
                                step={0.5}
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div
                            className={`w-12 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
                            onClick={() => setForm({ ...form, is_active: !form.is_active })}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_active ? 'left-7' : 'left-1'}`} />
                        </div>
                        <span className="font-bold">Active (visible to clients)</span>
                    </label>
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="ghost" size="md" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button variant="primary" size="md" disabled={saving || !form.name} onClick={() => onSave(form)} className="flex-1">
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────

type Tab = 'today' | 'bookings' | 'services' | 'availability' | 'settings';

export function GroomerDashboard() {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();

    const [activeTab, setActiveTab] = useState<Tab>('today');

    // data
    const [profile, setProfile] = useState<GroomerProfile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
    const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
    const [loading, setLoading] = useState(true);

    // modals / forms
    const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState('');

    const [serviceModal, setServiceModal] = useState<{ open: boolean; service: Partial<Service> | null }>({ open: false, service: null });
    const [serviceSaving, setServiceSaving] = useState(false);
    const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);

    // availability
    const [hoursSaving, setHoursSaving] = useState(false);
    const [hoursState, setHoursState] = useState<Record<number, { active: boolean; start: string; end: string }>>({});
    const [newBlock, setNewBlock] = useState({ date: '', start: '', end: '', reason: '' });
    const [blockSaving, setBlockSaving] = useState(false);

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // ── Fetch all data ──────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [profileRes, bookingsRes, hoursRes, blocksRes] = await Promise.all([
                fetch(`${API_BASE}/groomer-profiles`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/groomer-working-hours`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/groomer-time-blocks`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            if (profileRes.ok) {
                const data = await profileRes.json();
                const p = Array.isArray(data) ? data[0] : data;
                setProfile(p);

                if (p?.id) {
                    const servicesRes = await fetch(
                        `${API_BASE}/groomer-profiles/${p.id}/my-services`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (servicesRes.ok) setServices(await servicesRes.json());
                }
            }
            if (bookingsRes.ok) setBookings(await bookingsRes.json());
            if (hoursRes.ok) {
                const hrs: WorkingHours[] = await hoursRes.json();
                setWorkingHours(hrs);
                const map: Record<number, { active: boolean; start: string; end: string }> = {};
                for (let d = 0; d < 7; d++) {
                    const found = hrs.find(h => h.day_of_week === d);
                    map[d] = found
                        ? { active: found.is_active, start: found.start_time, end: found.end_time }
                        : { active: false, start: '09:00', end: '17:00' };
                }
                setHoursState(map);
            }
            if (blocksRes.ok) setTimeBlocks(await blocksRes.json());
        } catch (err) {
            console.error('Groomer dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const now = new Date();
    const todayBookings = bookings.filter(b =>
        !b.cancelled && b.status !== 'CANCELLED' && isToday(b.start_datetime)
    ).sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());

    const upcomingBookings = bookings.filter(b =>
        !b.cancelled && b.status !== 'CANCELLED' && new Date(b.start_datetime) >= now
    ).sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());

    const firstName = profile?.display_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

    // ── Cancel booking ──────────────────────────────────────────────────────
    const handleCancelConfirm = async () => {
        if (!cancelTargetId || !token) return;
        setCancelLoading(true);
        setCancelError('');
        try {
            const res = await fetch(`${API_BASE}/bookings/${cancelTargetId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ cancelled: true, status: 'CANCELLED', cancellation_reason: cancelReason || undefined }),
            });
            if (!res.ok) {
                const err = await res.json();
                setCancelError(err.error ?? 'Cancellation failed');
                return;
            }
            setBookings(prev => prev.map(b => b.id === cancelTargetId ? { ...b, cancelled: true, status: 'CANCELLED' } : b));
            setCancelTargetId(null);
            setCancelReason('');
        } finally {
            setCancelLoading(false);
        }
    };

    // ── Services CRUD ───────────────────────────────────────────────────────
    const handleSaveService = async (data: Partial<Service>) => {
        setServiceSaving(true);
        try {
            const isEdit = !!serviceModal.service?.id;
            const url = isEdit ? `${API_BASE}/services/${serviceModal.service!.id}` : `${API_BASE}/services`;
            const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers, body: JSON.stringify(data) });
            if (res.ok) {
                const saved = await res.json();
                setServices(prev => isEdit ? prev.map(s => s.id === saved.id ? saved : s) : [...prev, saved]);
                setServiceModal({ open: false, service: null });
            }
        } finally {
            setServiceSaving(false);
        }
    };

    const handleDeleteService = async (id: string) => {
        const res = await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE', headers });
        if (res.ok) setServices(prev => prev.filter(s => s.id !== id));
        setDeleteServiceId(null);
    };

    const handleToggleServiceActive = async (service: Service) => {
        const res = await fetch(`${API_BASE}/services/${service.id}`, {
            method: 'PUT', headers, body: JSON.stringify({ is_active: !service.is_active }),
        });
        if (res.ok) {
            const saved = await res.json();
            setServices(prev => prev.map(s => s.id === saved.id ? saved : s));
        }
    };

    // ── Working Hours ───────────────────────────────────────────────────────
    const handleSaveHours = async () => {
        if (!token) return;
        setHoursSaving(true);
        try {
            for (let day = 0; day < 7; day++) {
                const hs = hoursState[day] ?? { active: false, start: '09:00', end: '17:00' };
                const existing = workingHours.find(h => h.day_of_week === day);

                if (existing) {
                    await fetch(`${API_BASE}/groomer-working-hours/${existing.id}`, {
                        method: 'PUT', headers,
                        body: JSON.stringify({ start_time: hs.start, end_time: hs.end, is_active: hs.active }),
                    });
                } else if (hs.active) {
                    await fetch(`${API_BASE}/groomer-working-hours`, {
                        method: 'POST', headers,
                        body: JSON.stringify({ day_of_week: day, start_time: hs.start, end_time: hs.end, is_active: true }),
                    });
                }
            }
            const res = await fetch(`${API_BASE}/groomer-working-hours`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setWorkingHours(await res.json());
        } finally {
            setHoursSaving(false);
        }
    };

    // ── Time Blocks ─────────────────────────────────────────────────────────
    const handleAddBlock = async () => {
        if (!newBlock.date || !newBlock.start || !newBlock.end) return;
        setBlockSaving(true);
        try {
            const start_datetime = new Date(`${newBlock.date}T${newBlock.start}`).toISOString();
            const end_datetime = new Date(`${newBlock.date}T${newBlock.end}`).toISOString();
            const res = await fetch(`${API_BASE}/groomer-time-blocks`, {
                method: 'POST', headers,
                body: JSON.stringify({ start_datetime, end_datetime, reason: newBlock.reason || undefined }),
            });
            if (res.ok) {
                const saved = await res.json();
                setTimeBlocks(prev => [...prev, saved]);
                setNewBlock({ date: '', start: '', end: '', reason: '' });
            }
        } finally {
            setBlockSaving(false);
        }
    };

    const handleDeleteBlock = async (id: string) => {
        const res = await fetch(`${API_BASE}/groomer-time-blocks/${id}`, { method: 'DELETE', headers });
        if (res.ok) setTimeBlocks(prev => prev.filter(b => b.id !== id));
    };

    // ── Loading ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
                         style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                    <p style={{ color: 'var(--color-text-secondary)' }}>Loading your dashboard…</p>
                </div>
            </div>
        );
    }

    const navItems: { tab: Tab; icon: React.ReactNode; label: string }[] = [
        { tab: 'today', icon: <Home size={20} />, label: "Today" },
        { tab: 'bookings', icon: <Calendar size={20} />, label: "Bookings" },
        { tab: 'services', icon: <Scissors size={20} />, label: "Services" },
        { tab: 'availability', icon: <Clock size={20} />, label: "Hours" },
        { tab: 'settings', icon: <Settings size={20} />, label: "Settings" },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: 'var(--color-surface)' }}>

            {/* ── Sidebar ── */}
            <aside className="hidden md:flex w-64 bg-white border-r border-[var(--color-border)] flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-[var(--color-border)]">
                    <div className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
                        Paw<span style={{ color: 'var(--color-primary)' }}>🐾</span>Book
                    </div>
                    <div className="text-xs font-bold mt-1" style={{ color: 'var(--color-text-secondary)' }}>Groomer Portal</div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    {navItems.map(({ tab, icon, label }) => (
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold truncate">{profile?.display_name ?? firstName}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Groomer</div>
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

                {/* ── TODAY ── */}
                {activeTab === 'today' && (
                    <div>
                        <div className="mb-8">
                            <h1 className="font-extrabold mb-1" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} 🐾
                            </h1>
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                {todayBookings.length === 0 ? 'No appointments today.' : `${todayBookings.length} appointment${todayBookings.length > 1 ? 's' : ''} today`}
                            </p>
                        </div>

                        {/* Stat Strip */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <Card className="p-5">
                                <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--color-primary)' }}>{todayBookings.length}</div>
                                <div className="font-bold text-sm" style={{ color: 'var(--color-text-secondary)' }}>Today</div>
                            </Card>
                            <Card className="p-5">
                                <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--color-success)' }}>{upcomingBookings.length}</div>
                                <div className="font-bold text-sm" style={{ color: 'var(--color-text-secondary)' }}>Upcoming</div>
                            </Card>
                            <Card className="p-5">
                                <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--color-accent)' }}>
                                    ${todayBookings.reduce((s, b) => s + b.service.price, 0)}
                                </div>
                                <div className="font-bold text-sm" style={{ color: 'var(--color-text-secondary)' }}>Today's Revenue</div>
                            </Card>
                        </div>

                        {todayBookings.length === 0 ? (
                            <Card className="p-12 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                                <div className="text-5xl mb-4">🐾</div>
                                <p className="font-bold">No appointments scheduled for today.</p>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {todayBookings.map(apt => (
                                    <div key={apt.id} className="flex gap-4">
                                        <div className="w-20 flex-shrink-0 pt-1">
                                            <div className="font-bold text-sm" style={{ color: 'var(--color-text-secondary)' }}>{formatTime(apt.start_datetime)}</div>
                                        </div>
                                        <AppointmentCard apt={apt} onCancel={() => setCancelTargetId(apt.id)} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── BOOKINGS ── */}
                {activeTab === 'bookings' && (
                    <div>
                        <h1 className="font-extrabold mb-8" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>All Bookings</h1>
                        <Card className="overflow-hidden overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                                    <th className="text-left p-4 font-extrabold">Date & Time</th>
                                    <th className="text-left p-4 font-extrabold">Dog</th>
                                    <th className="text-left p-4 font-extrabold">Owner</th>
                                    <th className="text-left p-4 font-extrabold">Service</th>
                                    <th className="text-left p-4 font-extrabold">Status</th>
                                    <th className="text-left p-4 font-extrabold">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookings.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>No bookings yet.</td></tr>
                                ) : (
                                    [...bookings]
                                        .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())
                                        .map(b => (
                                            <tr key={b.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary-light)] transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold">{formatDate(b.start_datetime)}</div>
                                                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{formatTime(b.start_datetime)}</div>
                                                </td>
                                                <td className="p-4 font-bold">{truncateText(b.dog.name, 21)}{b.dog.breed ? ` · ${truncateText(b.dog.breed, 18)}` : ''}</td>
                                                <td className="p-4">{b.customer_profile.first_name} {b.customer_profile.last_name}</td>
                                                <td className="p-4">{b.service.name} · <span style={{ color: 'var(--color-primary)' }}>${b.service.price}</span></td>
                                                <td className="p-4">
                                                    <Badge variant={b.cancelled || b.status === 'CANCELLED' ? 'error' : b.status === 'COMPLETED' ? 'success' : b.status === 'CONFIRMED' ? 'success' : 'primary'}>
                                                        {b.cancelled ? 'Cancelled' : b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    {!b.cancelled && b.status !== 'CANCELLED' && new Date(b.start_datetime) > now && (
                                                        <button
                                                            className="text-sm font-bold"
                                                            style={{
                                                                color: (new Date(b.start_datetime).getTime() - now.getTime()) / 3_600_000 >= 24
                                                                    ? 'var(--color-error)'
                                                                    : 'var(--color-text-secondary)',
                                                                cursor: (new Date(b.start_datetime).getTime() - now.getTime()) / 3_600_000 >= 24
                                                                    ? 'pointer'
                                                                    : 'not-allowed',
                                                                opacity: (new Date(b.start_datetime).getTime() - now.getTime()) / 3_600_000 >= 24 ? 1 : 0.5,
                                                            }}
                                                            title={(new Date(b.start_datetime).getTime() - now.getTime()) / 3_600_000 < 24 ? 'Cancellations must be made at least 24 hours in advance' : undefined}
                                                            onClick={() => {
                                                                if ((new Date(b.start_datetime).getTime() - now.getTime()) / 3_600_000 >= 24) {
                                                                    setCancelTargetId(b.id);
                                                                }
                                                            }}
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

                {/* ── SERVICES ── */}
                {activeTab === 'services' && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="font-extrabold" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>My Services</h1>
                            <Button variant="primary" size="sm" onClick={() => setServiceModal({ open: true, service: null })}>
                                <Plus size={16} className="inline mr-1" /> Add Service
                            </Button>
                        </div>

                        {services.length === 0 ? (
                            <Card className="p-12 text-center">
                                <div className="text-5xl mb-4">✂️</div>
                                <p className="font-bold mb-4" style={{ color: 'var(--color-text-secondary)' }}>No services yet. Add your first one!</p>
                                <Button variant="primary" size="md" onClick={() => setServiceModal({ open: true, service: null })}>Add Service</Button>
                            </Card>
                        ) : (
                            <Card className="overflow-hidden overflow-x-auto">
                                <table className="w-full min-w-[500px]">
                                    <thead>
                                    <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                                        <th className="text-left p-4 font-extrabold">Name</th>
                                        <th className="text-left p-4 font-extrabold">Duration</th>
                                        <th className="text-left p-4 font-extrabold">Price</th>
                                        <th className="text-left p-4 font-extrabold">Status</th>
                                        <th className="text-left p-4 font-extrabold">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {services.map(s => (
                                        <tr key={s.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary-light)] transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold">{s.name}</div>
                                                {s.description && <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{s.description}</div>}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1"><Clock size={14} /> {s.duration_minutes} min</div>
                                            </td>
                                            <td className="p-4 font-extrabold" style={{ color: 'var(--color-primary)' }}>${s.price}</td>
                                            <td className="p-4">
                                                <button onClick={() => handleToggleServiceActive(s)} className="flex items-center gap-2">
                                                    <div className={`w-10 h-5 rounded-full transition-colors relative ${s.is_active ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}>
                                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${s.is_active ? 'left-5' : 'left-0.5'}`} />
                                                    </div>
                                                    <span className="text-sm font-bold">{s.is_active ? 'Active' : 'Hidden'}</span>
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-3">
                                                    <button className="font-bold flex items-center gap-1" style={{ color: 'var(--color-primary)' }}
                                                            onClick={() => setServiceModal({ open: true, service: s })}>
                                                        <Pencil size={14} /> Edit
                                                    </button>
                                                    <button className="font-bold flex items-center gap-1" style={{ color: 'var(--color-error)' }}
                                                            onClick={() => setDeleteServiceId(s.id)}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </Card>
                        )}
                    </div>
                )}

                {/* ── AVAILABILITY ── */}
                {activeTab === 'availability' && (
                    <div>
                        <h1 className="font-extrabold mb-8" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>Working Hours</h1>

                        <Card className="p-6 mb-8">
                            <div className="space-y-4">
                                {DAY_NAMES.map((day, idx) => {
                                    const hs = hoursState[idx] ?? { active: false, start: '09:00', end: '17:00' };
                                    return (
                                        <div key={day} className="flex items-center gap-4 flex-wrap">
                                            <div className="w-28 font-bold">{day}</div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <div
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${hs.active ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
                                                    onClick={() => setHoursState(prev => ({ ...prev, [idx]: { ...hs, active: !hs.active } }))}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${hs.active ? 'left-5' : 'left-0.5'}`} />
                                                </div>
                                                <span className="font-bold text-sm">{hs.active ? 'Open' : 'Closed'}</span>
                                            </label>
                                            {hs.active && (
                                                <>
                                                    <input
                                                        type="time"
                                                        value={hs.start}
                                                        onChange={e => setHoursState(prev => ({ ...prev, [idx]: { ...hs, start: e.target.value } }))}
                                                        className="px-3 py-2 rounded-xl border border-[var(--color-border)] font-bold"
                                                    />
                                                    <span style={{ color: 'var(--color-text-secondary)' }}>to</span>
                                                    <input
                                                        type="time"
                                                        value={hs.end}
                                                        onChange={e => setHoursState(prev => ({ ...prev, [idx]: { ...hs, end: e.target.value } }))}
                                                        className="px-3 py-2 rounded-xl border border-[var(--color-border)] font-bold"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6">
                                <Button variant="primary" size="md" onClick={handleSaveHours} disabled={hoursSaving}>
                                    {hoursSaving ? 'Saving…' : 'Save Working Hours'}
                                </Button>
                            </div>
                        </Card>

                        {/* Blocked Time */}
                        <h2 className="font-extrabold mb-4" style={{ fontSize: '20px' }}>Block Time</h2>
                        <Card className="p-6 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block font-bold mb-2 text-sm">Date</label>
                                    <input type="date" value={newBlock.date}
                                           onChange={e => setNewBlock({ ...newBlock, date: e.target.value })}
                                           className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm">Start Time</label>
                                    <input type="time" value={newBlock.start}
                                           onChange={e => setNewBlock({ ...newBlock, start: e.target.value })}
                                           className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm">End Time</label>
                                    <input type="time" value={newBlock.end}
                                           onChange={e => setNewBlock({ ...newBlock, end: e.target.value })}
                                           className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm">Reason (optional)</label>
                                    <input value={newBlock.reason}
                                           onChange={e => setNewBlock({ ...newBlock, reason: e.target.value })}
                                           placeholder="e.g. Lunch"
                                           className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                            </div>
                            <Button variant="primary" size="sm" onClick={handleAddBlock} disabled={blockSaving || !newBlock.date || !newBlock.start || !newBlock.end}>
                                {blockSaving ? 'Blocking…' : '+ Block This Time'}
                            </Button>
                        </Card>

                        {/* Existing blocks */}
                        {timeBlocks.length > 0 && (
                            <div className="space-y-3">
                                {[...timeBlocks].sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()).map(block => (
                                    <Card key={block.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-bold">{formatDate(block.start_datetime)}</div>
                                            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                {formatTime(block.start_datetime)} – {formatTime(block.end_datetime)}
                                                {block.reason && ` · ${block.reason}`}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteBlock(block.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" style={{ color: 'var(--color-error)' }}>
                                            <X size={18} />
                                        </button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── SETTINGS ── */}
                {activeTab === 'settings' && (
                    <div>
                        <h1 className="font-extrabold mb-8" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>Settings</h1>
                        <SettingsPage userType="groomer" />
                    </div>
                )}
            </main>

            {/* ── Cancel Modal ── */}
            {cancelTargetId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                     onClick={() => { setCancelTargetId(null); setCancelReason(''); setCancelError(''); }}>
                    <Card className="p-8 w-full max-w-md" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 16px 64px rgba(0,0,0,0.14)' }}>
                        <h3 className="font-extrabold mb-4" style={{ fontSize: '20px' }}>Cancel this appointment?</h3>
                        {(() => {
                            const apt = bookings.find(b => b.id === cancelTargetId);
                            if (!apt) return null;
                            return (
                                <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                                    <div className="font-bold">{truncateText(apt.dog.name, 21)} · {apt.service.name}</div>
                                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        {formatDate(apt.start_datetime)} at {formatTime(apt.start_datetime)}
                                    </div>
                                    <div className="text-sm">{apt.customer_profile.first_name} {apt.customer_profile.last_name}</div>
                                </div>
                            );
                        })()}
                        <label className="block font-bold mb-2">Reason (shown to customer)</label>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] mb-4"
                            placeholder="Enter cancellation reason…"
                            maxLength={200}
                        />
                        {cancelError && (
                            <p className="text-sm font-bold mb-4" style={{ color: 'var(--color-error)' }}>
                                ⚠️ {cancelError}
                            </p>
                        )}
                        <div className="flex gap-3">
                            <Button variant="ghost" size="md" onClick={() => { setCancelTargetId(null); setCancelReason(''); setCancelError(''); }} className="flex-1">Go Back</Button>
                            <Button variant="destructive" size="md" onClick={handleCancelConfirm} disabled={cancelLoading} className="flex-1">
                                {cancelLoading ? 'Cancelling…' : 'Send Cancellation'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* ── Service Form Modal ── */}
            {serviceModal.open && (
                <ServiceFormModal
                    service={serviceModal.service}
                    onSave={handleSaveService}
                    onClose={() => setServiceModal({ open: false, service: null })}
                    saving={serviceSaving}
                />
            )}

            {/* ── Delete Service Confirm ── */}
            {deleteServiceId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteServiceId(null)}>
                    <Card className="p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                        <div className="text-5xl mb-4">⚠️</div>
                        <h3 className="font-extrabold mb-2" style={{ fontSize: '20px' }}>Delete this service?</h3>
                        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>This cannot be undone.</p>
                        <div className="flex gap-3">
                            <Button variant="ghost" size="md" onClick={() => setDeleteServiceId(null)} className="flex-1">Cancel</Button>
                            <Button variant="destructive" size="md" onClick={() => handleDeleteService(deleteServiceId)} className="flex-1">Delete</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* ── Mobile Bottom Nav ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] z-50">
                <div className="flex justify-around items-center py-2">
                    {navItems.map(({ tab, icon, label }) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${activeTab === tab ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                            {icon}
                            <span className="text-xs mt-1 font-bold">{label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}

