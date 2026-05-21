import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Dog, Settings, LogOut, Plus, Pencil, Home, Clock } from 'lucide-react';
import { truncateText } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SettingsPage } from './SettingsPage';
import { useAuth } from '../hooks/AuthContext';

const API_BASE = '/api';

interface Booking {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  cancelled: boolean;
  dog: { id: string; name: string; breed?: string };
  service: { name: string; duration_minutes: number; price: number };
  groomer_profile: { display_name: string };
}

interface DogRecord {
  id: string;
  name: string;
  breed?: string;
  weight_kg?: number;
  temperament?: string;
  notes?: string;
}

interface CustomerProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function BookingCard({ apt, onCancel }: { apt: Booking; onCancel: () => void }) {
  const now = new Date();
  const appointmentTime = new Date(apt.start_datetime);
  const isPast = appointmentTime < now || apt.cancelled || apt.status === 'CANCELLED';
  const hoursUntil = (appointmentTime.getTime() - now.getTime()) / 3_600_000;
  const canCancel = !isPast && hoursUntil >= 24;

  return (
      <Card className="p-4 border-l-4" style={{ borderColor: isPast ? 'var(--color-border)' : 'var(--color-primary)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
            >
              {apt.groomer_profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-extrabold">{apt.groomer_profile.display_name}</div>
              <div className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                {formatDate(apt.start_datetime)} at {formatTime(apt.start_datetime)}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                >
                  🐾 {truncateText(apt.dog.name, 21)}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                · {apt.service.name}
              </span>
                {apt.service.price != null && (
                    <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                  · ${apt.service.price}
                </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 ml-2 shrink-0">
            {apt.cancelled || apt.status === 'CANCELLED' ? (
                <Badge variant="error">Cancelled</Badge>
            ) : apt.status === 'COMPLETED' ? (
                <Badge variant="success">Completed</Badge>
            ) : apt.status === 'CONFIRMED' ? (
                <Badge variant="success">Confirmed</Badge>
            ) : (
                <Badge variant="primary">Pending</Badge>
            )}
            {!isPast && (
                <button
                    onClick={canCancel ? onCancel : undefined}
                    className="text-sm font-bold px-3 py-1 rounded-lg transition-colors"
                    style={{
                      color: canCancel ? 'var(--color-error)' : 'var(--color-text-secondary)',
                      cursor: canCancel ? 'pointer' : 'not-allowed',
                      opacity: canCancel ? 1 : 0.5,
                    }}
                    title={canCancel ? undefined : 'Cancellations must be made at least 24 hours in advance'}
                >
                  Cancel
                </button>
            )}
          </div>
        </div>
      </Card>
  );
}

type Tab = 'overview' | 'appointments' | 'dogs' | 'history' | 'settings';

export function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [appointmentsSubTab, setAppointmentsSubTab] = useState<'upcoming' | 'past'>('upcoming');

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dogs, setDogs] = useState<DogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [profileRes, bookingsRes, dogsRes] = await Promise.all([
          fetch(`${API_BASE}/customer-profiles`, { headers }),
          fetch(`${API_BASE}/bookings`, { headers }),
          fetch(`${API_BASE}/dogs`, { headers }),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(Array.isArray(data) ? data[0] : data);
        }
        if (bookingsRes.ok) setBookings(await bookingsRes.json());
        if (dogsRes.ok) setDogs(await dogsRes.json());
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  const now = new Date();

  const upcomingBookings = bookings
      .filter((b) => !b.cancelled && b.status !== 'CANCELLED' && new Date(b.start_datetime) >= now)
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());

  const pastBookings = bookings
      .filter((b) => b.cancelled || b.status === 'CANCELLED' || new Date(b.start_datetime) < now)
      .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime());

  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const firstName = profile?.first_name ?? user?.email?.split('@')[0] ?? 'there';
  const nextBooking = upcomingBookings[0];
  const daysUntilNext = nextBooking
      ? Math.ceil((new Date(nextBooking.start_datetime).getTime() - now.getTime()) / 86400000)
      : null;

  const handleCancelConfirm = async () => {
    if (!cancelTargetId || !token) return;
    setCancelLoading(true);
    setCancelError('');
    try {
      const res = await fetch(`${API_BASE}/bookings/${cancelTargetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cancelled: true,
          status: 'CANCELLED',
          cancellation_reason: cancelReason || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setCancelError(err.error ?? 'Cancellation failed');
        return;
      }
      setBookings((prev) =>
          prev.map((b) =>
              b.id === cancelTargetId ? { ...b, cancelled: true, status: 'CANCELLED' } : b
          )
      );
      setShowCancelModal(false);
      setCancelTargetId(null);
      setCancelReason('');
    } catch (err) {
      console.error('Cancel error:', err);
      setCancelError('Something went wrong. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const openCancelModal = (id: string) => {
    setCancelTargetId(id);
    setCancelError('');
    setShowCancelModal(true);
  };

  const navItems = [
    { tab: 'overview' as Tab, icon: <Home size={20} />, label: 'Overview' },
    { tab: 'appointments' as Tab, icon: <Calendar size={20} />, label: 'My Appointments' },
    { tab: 'dogs' as Tab, icon: <Dog size={20} />, label: 'My Dogs' },
    { tab: 'history' as Tab, icon: <Clock size={20} />, label: 'History' },
    { tab: 'settings' as Tab, icon: <Settings size={20} />, label: 'Settings' },
  ];

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="text-center space-y-4">
            <div
                className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading your dashboard…</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: 'var(--color-surface)' }}>

        {/* ── Sidebar (Desktop) ── */}
        <aside className="hidden md:flex w-64 bg-white border-r border-[var(--color-border)] flex-col sticky top-0 h-screen">
          <div className="p-6 border-b border-[var(--color-border)]">
            <button
                onClick={() => navigate('/')}
                className="text-2xl font-extrabold text-left hover:opacity-80 transition-opacity"
                style={{ fontFamily: 'var(--font-display)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Paw<span style={{ color: 'var(--color-primary)' }}>🐾</span>Book
            </button>

          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            {navItems.map(({ tab, icon, label }) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-1 transition-all flex items-center gap-3 ${
                        activeTab === tab
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'hover:bg-[var(--color-primary-light)]'
                    }`}
                >
                  {icon}
                  {label}
                </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate">
                  {firstName} {profile?.last_name ?? ''}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Customer
                </div>
              </div>
            </div>
            <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-50 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 p-4 md:p-8 overflow-auto pb-24 md:pb-8 max-w-full">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
              <div>
                <div className="mb-8">
                  <h1 className="font-extrabold mb-2" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>
                    Hey {firstName} 👋
                  </h1>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {daysUntilNext !== null
                        ? `${nextBooking?.dog?.name ? truncateText(nextBooking.dog.name, 21) : 'Your dog'}'s next groom is ${
                            daysUntilNext === 0 ? 'today!' : daysUntilNext === 1 ? 'tomorrow' : `in ${daysUntilNext} days`
                        }`
                        : 'No upcoming appointments yet.'}
                  </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <Card className="p-6">
                    <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--color-primary)' }}>
                      {upcomingBookings.length}
                    </div>
                    <div className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>Upcoming</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--color-success)' }}>
                      {completedCount}
                    </div>
                    <div className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>Completed</div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--color-accent)' }}>
                      {dogs.length}
                    </div>
                    <div className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>Dogs</div>
                  </Card>
                </div>

                {/* Next Appointment Hero */}
                {nextBooking && (
                    <Card
                        className="p-6 mb-8"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark, #7c3aed) 100%)',
                          color: 'white',
                        }}
                    >
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                          <div className="text-sm font-bold opacity-80 mb-1">Next Appointment</div>
                          <div className="font-extrabold text-xl mb-1">{nextBooking.groomer_profile.display_name}</div>
                          <div className="opacity-90 mb-2">
                            {formatDate(nextBooking.start_datetime)} at {formatTime(nextBooking.start_datetime)}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                        <span className="text-sm px-3 py-1 rounded-full font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                        🐾 {truncateText(nextBooking.dog.name, 21)}
                      </span>
                            <span className="text-sm px-3 py-1 rounded-full font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                        ✂️ {nextBooking.service.name}
                      </span>
                          </div>
                        </div>
                        <button
                            onClick={() => {
                              const hoursUntil = (new Date(nextBooking.start_datetime).getTime() - Date.now()) / 3_600_000;
                              if (hoursUntil < 24) return;
                              openCancelModal(nextBooking.id);
                            }}
                            className="text-sm font-bold px-4 py-2 rounded-xl transition-all"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              opacity: (new Date(nextBooking.start_datetime).getTime() - Date.now()) / 3_600_000 < 24 ? 0.5 : 1,
                              cursor: (new Date(nextBooking.start_datetime).getTime() - Date.now()) / 3_600_000 < 24 ? 'not-allowed' : 'pointer',
                            }}
                            title={(new Date(nextBooking.start_datetime).getTime() - Date.now()) / 3_600_000 < 24 ? 'Cancellations must be made at least 24 hours in advance' : undefined}
                        >
                          Cancel
                        </button>
                      </div>
                    </Card>
                )}

                {/* Upcoming preview */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-extrabold" style={{ fontSize: '20px' }}>
                      {nextBooking ? 'All Upcoming' : 'Upcoming Appointments'}
                    </h2>
                    <Button variant="primary" size="sm" onClick={() => navigate('/groomers')}>
                      + Book Now
                    </Button>
                  </div>

                  {upcomingBookings.length === 0 ? (
                      <Card className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        No upcoming appointments.{' '}
                        <button onClick={() => navigate('/groomers')} className="font-bold underline" style={{ color: 'var(--color-primary)' }}>
                          Book one now
                        </button>
                      </Card>
                  ) : (
                      <div className="space-y-4">
                        {upcomingBookings.slice(0, 3).map((apt) => (
                            <BookingCard key={apt.id} apt={apt} onCancel={() => openCancelModal(apt.id)} />
                        ))}
                        {upcomingBookings.length > 3 && (
                            <button
                                onClick={() => setActiveTab('appointments')}
                                className="w-full text-center font-bold py-2"
                                style={{ color: 'var(--color-primary)' }}
                            >
                              View all {upcomingBookings.length} appointments →
                            </button>
                        )}
                      </div>
                  )}
                </div>

                {/* Dogs quick view */}
                {dogs.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-extrabold" style={{ fontSize: '20px' }}>My Dogs</h2>
                        <button
                            onClick={() => setActiveTab('dogs')}
                            className="font-bold text-sm"
                            style={{ color: 'var(--color-primary)' }}
                        >
                          Manage →
                        </button>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {dogs.map((dog) => (
                            <div
                                key={dog.id}
                                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold cursor-pointer hover:scale-105 transition-transform"
                                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                                onClick={() => navigate(`/dashboard/dogs/${dog.id}/edit`)}
                            >
                              🐾 {truncateText(dog.name, 21)}
                              {dog.breed && <span className="text-xs opacity-70">· {truncateText(dog.breed, 18)}</span>}
                            </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>
          )}

          {/* ── APPOINTMENTS ── */}
          {activeTab === 'appointments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="font-extrabold" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>
                    My Appointments
                  </h1>
                  <Button variant="primary" size="sm" onClick={() => navigate('/groomers')}>
                    + Book New
                  </Button>
                </div>

                <div className="flex gap-3 mb-6">
                  {(['upcoming', 'past'] as const).map((sub) => (
                      <button
                          key={sub}
                          onClick={() => setAppointmentsSubTab(sub)}
                          className={`px-6 py-3 rounded-full font-bold capitalize transition-all ${
                              appointmentsSubTab === sub
                                  ? 'bg-[var(--color-primary)] text-white'
                                  : 'border border-[var(--color-border)] hover:border-[var(--color-primary)]'
                          }`}
                      >
                        {sub === 'upcoming' ? `Upcoming (${upcomingBookings.length})` : `Past (${pastBookings.length})`}
                      </button>
                  ))}
                </div>

                {appointmentsSubTab === 'upcoming' && (
                    <div className="space-y-4">
                      {upcomingBookings.length === 0 ? (
                          <Card className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                            No upcoming appointments.{' '}
                            <button onClick={() => navigate('/groomers')} className="font-bold underline" style={{ color: 'var(--color-primary)' }}>
                              Book one
                            </button>
                          </Card>
                      ) : (
                          upcomingBookings.map((apt) => (
                              <BookingCard key={apt.id} apt={apt} onCancel={() => openCancelModal(apt.id)} />
                          ))
                      )}
                    </div>
                )}

                {appointmentsSubTab === 'past' && (
                    <div className="space-y-4">
                      {pastBookings.length === 0 ? (
                          <Card className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                            No past appointments.
                          </Card>
                      ) : (
                          pastBookings.map((apt) => (
                              <BookingCard key={apt.id} apt={apt} onCancel={() => {}} />
                          ))
                      )}
                    </div>
                )}
              </div>
          )}

          {/* ── DOGS ── */}
          {activeTab === 'dogs' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="font-extrabold" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>
                    My Dogs
                  </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {dogs.map((dog) => (
                      <Card key={dog.id} className="p-6 relative group">
                        <button
                            onClick={() => navigate(`/dashboard/dogs/${dog.id}/edit`)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                            title="Edit dog"
                        >
                          <Pencil size={14} />
                        </button>
                        <div
                            className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-[var(--color-accent)] flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-primary-light)' }}
                        >
                          <Dog size={40} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <h3 className="font-extrabold text-center mb-1">{truncateText(dog.name, 21)}</h3>
                        <div className="text-sm text-center mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                          {[dog.breed ? truncateText(dog.breed, 18) : dog.breed, dog.weight_kg ? `${dog.weight_kg} kg` : null].filter(Boolean).join(' · ')}
                        </div>
                        {dog.temperament && (
                            <div className="flex justify-center mb-2">
                      <span
                          className="text-xs px-3 py-1 rounded-full font-bold"
                          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-dark)' }}
                      >
                        {dog.temperament}
                      </span>
                            </div>
                        )}
                        {dog.notes && (
                            <p className="text-sm italic text-center line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                              "{dog.notes}"
                            </p>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => navigate(`/dashboard/dogs/${dog.id}/edit`)}
                        >
                          Edit Profile
                        </Button>
                      </Card>
                  ))}

                  <Card
                      className="p-6 border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-all min-h-[280px]"
                      onClick={() => navigate('/dashboard/dogs/new')}
                  >
                    <div
                        className="w-24 h-24 rounded-full mb-4 flex items-center justify-center transition-colors"
                        style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      <Plus size={40} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="font-bold" style={{ color: 'var(--color-primary)' }}>
                      Add a Dog
                    </div>
                  </Card>
                </div>
              </div>
          )}

          {/* ── HISTORY ── */}
          {activeTab === 'history' && (
              <div>
                <h1 className="font-extrabold mb-8" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>
                  Appointment History
                </h1>

                <Card className="overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                    <tr className="border-b border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                      <th className="text-left p-4 font-extrabold">Date</th>
                      <th className="text-left p-4 font-extrabold">Groomer</th>
                      <th className="text-left p-4 font-extrabold">Dog</th>
                      <th className="text-left p-4 font-extrabold">Service</th>
                      <th className="text-left p-4 font-extrabold">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                            No bookings yet.
                          </td>
                        </tr>
                    ) : (
                        [...bookings]
                            .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())
                            .map((apt) => (
                                <tr
                                    key={apt.id}
                                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary-light)] transition-colors"
                                >
                                  <td className="p-4">{formatDate(apt.start_datetime)}</td>
                                  <td className="p-4 font-bold">{apt.groomer_profile.display_name}</td>
                                  <td className="p-4">{truncateText(apt.dog.name, 21)}</td>
                                  <td className="p-4">{apt.service.name}</td>
                                  <td className="p-4">
                                    <Badge
                                        variant={
                                          apt.status === 'COMPLETED'
                                              ? 'success'
                                              : apt.cancelled || apt.status === 'CANCELLED'
                                                  ? 'error'
                                                  : apt.status === 'CONFIRMED'
                                                      ? 'success'
                                                      : 'primary'
                                        }
                                    >
                                      {apt.cancelled ? 'Cancelled' : apt.status.charAt(0) + apt.status.slice(1).toLowerCase()}
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

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
              <div>
                <h1 className="font-extrabold mb-8" style={{ fontSize: '28px', fontFamily: 'var(--font-heading)' }}>
                  Settings
                </h1>
                <SettingsPage userType="customer" />
              </div>
          )}
        </main>

        {/* ── Cancel Modal ── */}
        {showCancelModal && (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => { setShowCancelModal(false); setCancelTargetId(null); setCancelReason(''); setCancelError(''); }}
            >
              <Card
                  className="p-8 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                  style={{ boxShadow: '0 16px 64px rgba(0,0,0,0.14)' }}
              >
                <h3 className="font-extrabold mb-4" style={{ fontSize: '20px' }}>
                  Cancel this appointment?
                </h3>
                {(() => {
                  const apt = bookings.find((b) => b.id === cancelTargetId);
                  if (!apt) return null;
                  return (
                      <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                        <div className="font-bold">{apt.groomer_profile.display_name}</div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {formatDate(apt.start_datetime)} at {formatTime(apt.start_datetime)}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {truncateText(apt.dog.name, 21)} · {apt.service.name}
                        </div>
                      </div>
                  );
                })()}
                <div className="mb-6">
                  <label className="block font-bold mb-2 text-sm">Reason (optional)</label>
                  <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Schedule conflict…"
                      className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                {cancelError && (
                    <p className="text-sm font-bold mb-4" style={{ color: 'var(--color-error)' }}>
                      ⚠️ {cancelError}
                    </p>
                )}
                <div className="flex gap-3">
                  <Button
                      variant="ghost"
                      size="md"
                      onClick={() => { setShowCancelModal(false); setCancelTargetId(null); setCancelReason(''); setCancelError(''); }}
                      className="flex-1"
                  >
                    Keep It
                  </Button>
                  <Button
                      variant="destructive"
                      size="md"
                      onClick={handleCancelConfirm}
                      disabled={cancelLoading}
                      className="flex-1"
                  >
                    {cancelLoading ? 'Cancelling…' : 'Yes, Cancel'}
                  </Button>
                </div>
              </Card>
            </div>
        )}

        {/* ── Mobile Bottom Nav ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] z-50">
          <div className="flex justify-around items-center py-2">
            {[
              { tab: 'overview' as Tab, icon: <Home size={22} />, label: 'Home' },
              { tab: 'appointments' as Tab, icon: <Calendar size={22} />, label: 'Bookings' },
              { tab: 'dogs' as Tab, icon: <Dog size={22} />, label: 'Dogs' },
              { tab: 'history' as Tab, icon: <Clock size={22} />, label: 'History' },
              { tab: 'settings' as Tab, icon: <Settings size={22} />, label: 'Settings' },
            ].map(({ tab, icon, label }) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                        activeTab === tab ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                    }`}
                >
                  {icon}
                  <span className="text-xs mt-1 font-bold">{label}</span>
                </button>
            ))}
          </div>
        </nav>
      </div>
  );
}