import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CheckCircle, Clock, Calendar, Star, Scissors, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Navbar } from '../components/Navbar';
import { MonthCalendar } from '../components/MonthCalendar';
import { useAuth } from '../hooks/AuthContext';

const API_BASE = '/api';


interface Groomer {
  id: string;
  display_name: string;
  bio?: string;
  specialties?: string;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
}

interface DogRecord {
  id: string;
  name: string;
  breed?: string;
  weight_kg?: number;
}



function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 17; h++) {
    for (const m of [0, 30]) {
      if (h === 17 && m === 30) continue;
      const hour = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      slots.push(`${hour}:${m === 0 ? '00' : '30'} ${ampm}`);
    }
  }
  return slots;
}

function parseSlot(dateObj: Date, timeStr: string): Date {
  const [time, meridiem] = timeStr.split(' ') as [string, string];

  let [hours, minutes] = time.split(':').map(Number) as [number, number];

  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const d = new Date(dateObj);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function toISO(d: Date) {
  return d.toISOString();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}


const STEPS = [
  { num: 1, label: 'Service' },
  { num: 2, label: 'Date & Time' },
  { num: 3, label: 'Your Dog' },
  { num: 4, label: 'Confirm' },
];

function StepIndicator({ current }: { current: number }) {
  return (
      <div className="flex items-center mb-12">
        {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold transition-all ${
                        step.num < current
                            ? 'bg-[var(--color-accent)] text-[var(--color-accent-dark)]'
                            : step.num === current
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {step.num < current ? <CheckCircle size={18} /> : step.num}
                </div>
                <div className="text-xs mt-2 font-bold text-center hidden sm:block">{step.label}</div>
              </div>
              {i < STEPS.length - 1 && (
                  <div
                      className={`h-1 flex-1 mx-2 rounded transition-all ${
                          step.num < current ? 'bg-[var(--color-accent)]' : 'bg-gray-200'
                      }`}
                  />
              )}
            </div>
        ))}
      </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function BookingFlow() {
  const navigate = useNavigate();
  const { groomerId } = useParams<{ groomerId: string }>();
  const { token, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [groomer, setGroomer] = useState<Groomer | null>(null);
  const [dogs, setDogs] = useState<DogRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const timeSlots = generateTimeSlots();

  // ── Fetch groomer + dogs ───────────────────────────────────────────────
  useEffect(() => {
    if (!token || !groomerId) return;

    const fetchData = async () => {
      setLoadingData(true);
      setFetchError('');
      try {
        const [groomerRes, dogsRes] = await Promise.all([
          fetch(`${API_BASE}/groomer-profiles/${groomerId}`),
          fetch(`${API_BASE}/dogs`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!groomerRes.ok) throw new Error('Groomer not found');
        const groomerData = await groomerRes.json();
        setGroomer(groomerData);

        if (dogsRes.ok) setDogs(await dogsRes.json());
      } catch (err: any) {
        setFetchError(err.message ?? 'Failed to load data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [groomerId, token]);

  const selectedService = groomer?.services.find((s) => s.id === selectedServiceId) ?? null;
  const selectedDog = dogs.find((d) => d.id === selectedDogId) ?? null;

  // ── Confirm booking ────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (!selectedServiceId || !selectedDate || !selectedTime || !selectedDogId || !token || !user) return;

    setBookingLoading(true);
    setBookingError('');

    try {
      const startDatetime = parseSlot(selectedDate, selectedTime);
      const endDatetime = new Date(startDatetime.getTime() + (selectedService!.duration_minutes * 60000));

      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groomer_profile_id: groomerId,
          service_id: selectedServiceId,
          dog_id: selectedDogId,
          start_datetime: toISO(startDatetime),
          end_datetime: toISO(endDatetime),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Booking failed');
      }

      const booking = await res.json();
      setConfirmedBooking(booking);
      setShowConfirmation(true);
    } catch (err: any) {
      setBookingError(err.message ?? 'Something went wrong');
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────
  if (loadingData) {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
          <Navbar />
          <div className="flex items-center justify-center py-40">
            <div
                className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
            />
          </div>
        </div>
    );
  }

  if (fetchError || !groomer) {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
          <Navbar />
          <div className="max-w-2xl mx-auto px-6 py-20 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="font-extrabold mb-4" style={{ fontSize: '24px' }}>
              {fetchError || 'Groomer not found'}
            </h2>
            <Button variant="primary" size="md" onClick={() => navigate('/groomers')}>
              Back to Groomers
            </Button>
          </div>
        </div>
    );
  }

  // ── Confirmation screen ────────────────────────────────────────────────
  if (showConfirmation) {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
          <Navbar />
          <div className="max-w-2xl mx-auto px-6 py-20 text-center">
            <div className="relative inline-block mb-8">
              <div
                  className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-success)' }}
              >
                <CheckCircle size={64} color="white" strokeWidth={2.5} />
              </div>
            </div>

            <h1
                className="mb-6"
                style={{ fontFamily: 'var(--font-display)', fontSize: '40px' }}
            >
              You're all booked! 🎉
            </h1>

            <Card className="p-8 mb-8 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-border)]">
                  <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl"
                      style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                  >
                    {groomer.display_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold">{groomer.display_name}</div>
                    {groomer.specialties && (
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {groomer.specialties}
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Scissors size={20} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <div className="font-bold">{selectedService?.name}</div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {selectedService?.duration_minutes} mins · ${selectedService?.price}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <div className="font-bold">
                      {selectedDate ? formatDate(selectedDate.toISOString()) : ''}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {selectedTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xl">🐾</span>
                  <div>
                    <div className="font-bold">{selectedDog?.name}</div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {selectedDog?.breed}
                      {selectedDog?.weight_kg ? ` · ${selectedDog.weight_kg} kg` : ''}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <div className="flex justify-between items-center">
                    <span>Total</span>
                    <span
                        className="font-extrabold"
                        style={{ fontSize: '28px', color: 'var(--color-primary)' }}
                    >
                    ${selectedService?.price}
                  </span>
                  </div>
                </div>
              </div>
            </Card>

            <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              Free cancellation up to 24 hours before your appointment.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="primary" size="lg" onClick={() => navigate('/dashboard/customer')}>
                View My Appointments
              </Button>
              <Button variant="ghost" size="lg" onClick={() => navigate('/groomers')}>
                Book Another
              </Button>
            </div>
          </div>
        </div>
    );
  }

  // ── Booking flow ───────────────────────────────────────────────────────
  const canProceed =
      (currentStep === 1 && !!selectedServiceId) ||
      (currentStep === 2 && !!selectedDate && !!selectedTime) ||
      (currentStep === 3 && !!selectedDogId) ||
      currentStep === 4;

  return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-12">

          {/* Back link */}
          <button
              onClick={() => navigate('/groomers')}
              className="flex items-center gap-2 font-bold mb-8 hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft size={18} />
            Back to Groomers
          </button>

          <StepIndicator current={currentStep} />

          {/* Groomer card */}
          <Card className="p-4 mb-8 flex items-center gap-4">
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl shrink-0"
                style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
            >
              {groomer.display_name.charAt(0)}
            </div>
            <div>
              <div className="font-extrabold">{groomer.display_name}</div>
              {groomer.specialties && (
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {groomer.specialties}
                  </div>
              )}
              {groomer.bio && (
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {groomer.bio}
                  </div>
              )}
            </div>
          </Card>

          {/* ── Step 1: Choose Service ── */}
          {currentStep === 1 && (
              <div>
                <h2 className="font-extrabold mb-6" style={{ fontSize: '24px' }}>Choose a Service</h2>
                {groomer.services.length === 0 ? (
                    <Card className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                      This groomer has no active services yet.
                    </Card>
                ) : (
                    <div className="space-y-3">
                      {groomer.services.map((service) => (
                          <Card
                              key={service.id}
                              className={`p-4 cursor-pointer transition-all ${
                                  selectedServiceId === service.id
                                      ? 'border-l-4 border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                                      : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedServiceId(service.id)}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                                      selectedServiceId === service.id
                                          ? 'border-[var(--color-primary)]'
                                          : 'border-gray-300'
                                  }`}
                              >
                                {selectedServiceId === service.id && (
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between flex-wrap gap-2">
                                  <div>
                                    <div className="font-extrabold">{service.name}</div>
                                    {service.description && (
                                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                          {service.description}
                                        </div>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div
                                        className="font-extrabold"
                                        style={{ color: 'var(--color-primary)', fontSize: '20px' }}
                                    >
                                      ${service.price}
                                    </div>
                                    <div
                                        className="text-sm flex items-center gap-1"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                      <Clock size={12} />
                                      {service.duration_minutes} mins
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                      ))}
                    </div>
                )}
              </div>
          )}

          {/* ── Step 2: Pick Date & Time ── */}
          {currentStep === 2 && (
              <div>
                <h2 className="font-extrabold mb-6" style={{ fontSize: '24px' }}>Pick a Date & Time</h2>

                <div className="mb-8 flex justify-center">
                  <MonthCalendar
                      selectedDate={selectedDate}
                      onSelectDate={(date) => { setSelectedDate(date); setSelectedTime(null); }}
                  />
                </div>

                {selectedDate ? (
                    <div>
                      <label className="block font-bold mb-3">
                        Available times for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {timeSlots.map((time) => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`p-3 rounded-full font-bold transition-all ${
                                    selectedTime === time
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'bg-white border border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
                                }`}
                            >
                              {time}
                            </button>
                        ))}
                      </div>
                    </div>
                ) : (
                    <div
                        className="text-center p-8 rounded-2xl"
                        style={{ backgroundColor: 'var(--color-primary-light)' }}
                    >
                      <Calendar size={48} className="mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
                      <p className="font-bold" style={{ color: 'var(--color-primary)' }}>
                        Select a date to view available times
                      </p>
                    </div>
                )}
              </div>
          )}

          {/* ── Step 3: Select Dog ── */}
          {currentStep === 3 && (
              <div>
                <h2 className="font-extrabold mb-6" style={{ fontSize: '24px' }}>Select Your Dog</h2>
                {dogs.length === 0 ? (
                    <Card className="p-8 text-center">
                      <div className="text-5xl mb-4">🐾</div>
                      <p className="font-bold mb-4">No dogs yet! Add one first.</p>
                      <Button variant="primary" size="md" onClick={() => navigate('/dashboard/dogs/new')}>
                        Add a Dog
                      </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {dogs.map((dog) => (
                          <Card
                              key={dog.id}
                              className={`p-4 cursor-pointer text-center transition-all ${
                                  selectedDogId === dog.id ? 'ring-4 ring-[var(--color-primary)]' : 'hover:shadow-md'
                              }`}
                              onClick={() => setSelectedDogId(dog.id)}
                          >
                            <div className="relative inline-block mb-3">
                              <div
                                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                                  style={{ backgroundColor: 'var(--color-primary-light)', fontSize: '40px' }}
                              >
                                🐶
                              </div>
                              {selectedDogId === dog.id && (
                                  <div
                                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                                      style={{ backgroundColor: 'var(--color-primary)' }}
                                  >
                                    <CheckCircle size={16} color="white" />
                                  </div>
                              )}
                            </div>
                            <div className="font-extrabold">{dog.name}</div>
                            {dog.breed && (
                                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                  {dog.breed}
                                </div>
                            )}
                            {dog.weight_kg && (
                                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                  {dog.weight_kg} kg
                                </div>
                            )}
                          </Card>
                      ))}

                      <Card
                          className="p-4 cursor-pointer text-center border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all"
                          onClick={() => navigate('/dashboard/dogs/new')}
                      >
                        <div
                            className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-primary-light)', fontSize: '36px' }}
                        >
                          +
                        </div>
                        <div className="font-bold" style={{ color: 'var(--color-primary)' }}>
                          Add a Dog
                        </div>
                      </Card>
                    </div>
                )}
              </div>
          )}

          {/* ── Step 4: Confirm ── */}
          {currentStep === 4 && selectedService && selectedDog && selectedDate && selectedTime && (
              <div>
                <h2 className="font-extrabold mb-6" style={{ fontSize: '24px' }}>Confirm Your Booking</h2>
                <Card className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-[var(--color-border)]">
                      <div
                          className="w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl"
                          style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                      >
                        {groomer.display_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold">{groomer.display_name}</div>
                        {groomer.specialties && (
                            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              {groomer.specialties}
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Scissors size={24} style={{ color: 'var(--color-primary)' }} />
                      <div className="flex-1">
                        <div className="font-bold">{selectedService.name}</div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {selectedService.duration_minutes} mins
                        </div>
                      </div>
                      <div className="font-extrabold" style={{ color: 'var(--color-primary)' }}>
                        ${selectedService.price}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Calendar size={24} style={{ color: 'var(--color-primary)' }} />
                      <div>
                        <div className="font-bold">{formatDate(selectedDate.toISOString())}</div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {selectedTime}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-2xl">🐾</span>
                      <div>
                        <div className="font-bold">{selectedDog.name}</div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {selectedDog.breed}
                          {selectedDog.weight_kg ? ` · ${selectedDog.weight_kg} kg` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--color-border)]">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl">Total</span>
                        <span
                            className="font-extrabold"
                            style={{ fontSize: '32px', color: 'var(--color-primary)' }}
                        >
                      ${selectedService.price}
                    </span>
                      </div>
                      <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        Free cancellation up to 24 hours before your appointment
                      </p>
                    </div>
                  </div>
                </Card>

                {bookingError && (
                    <div
                        className="mt-4 p-4 rounded-2xl text-sm font-bold"
                        style={{ backgroundColor: '#FFF5F5', color: 'var(--color-error)' }}
                    >
                      ⚠️ {bookingError}
                    </div>
                )}
              </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => { setCurrentStep(currentStep - 1); setBookingError(''); }}
                    className="flex-1"
                >
                  Back
                </Button>
            )}
            <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (currentStep === 4) {
                    handleConfirmBooking();
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={!canProceed || bookingLoading || (currentStep === 1 && groomer.services.length === 0)}
                className="flex-1"
            >
              {currentStep === 4
                  ? bookingLoading
                      ? 'Booking…'
                      : 'Confirm Booking'
                  : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
  );
}