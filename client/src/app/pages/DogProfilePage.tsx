import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Upload, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuth } from '../hooks/AuthContext';

const API_BASE = '/api';

const temperamentOptions = ['Calm', 'Anxious', 'Playful', 'Energetic', 'Aggressive', 'Shy'];

interface DogForm {
  name: string;
  breed: string;
  weight_kg: string;
  temperament: string[];
  notes: string;
}

const EMPTY_FORM: DogForm = {
  name: '',
  breed: '',
  weight_kg: '',
  temperament: [],
  notes: '',
};

export function DogProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const isEditMode = !!id && id !== 'new';

  const [form, setForm] = useState<DogForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');

  // Fetch dog data in edit mode
  useEffect(() => {
    if (!isEditMode || !token) return;

    const fetchDog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/dogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Dog not found');
        const dog = await res.json();
        setForm({
          name: dog.name ?? '',
          breed: dog.breed ?? '',
          weight_kg: dog.weight_kg != null ? String(dog.weight_kg) : '',
          temperament: dog.temperament ? dog.temperament.split(',').map((t: string) => t.trim()) : [],
          notes: dog.notes ?? '',
        });
      } catch (err: any) {
        setError(err.message ?? 'Failed to load dog');
      } finally {
        setLoading(false);
      }
    };

    fetchDog();
  }, [id, token, isEditMode]);

  const toggleTemperament = (temp: string) => {
    setForm((prev) => ({
      ...prev,
      temperament: prev.temperament.includes(temp)
          ? prev.temperament.filter((t) => t !== temp)
          : [...prev.temperament, temp],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setSaving(true);

    const body = {
      name: form.name,
      breed: form.breed || undefined,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
      temperament: form.temperament.length > 0 ? form.temperament.join(', ') : null,
      notes: form.notes || undefined,
    };

    try {
      const url = isEditMode ? `${API_BASE}/dogs/${id}` : `${API_BASE}/dogs`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Save failed');
      }

      navigate('/dashboard/customer');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !id) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/dogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Delete failed');
      }
      navigate('/dashboard/customer');
    } catch (err: any) {
      setError(err.message ?? 'Delete failed');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          />
        </div>
    );
  }

  return (
      <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-2xl mx-auto">
          <button
              onClick={() => navigate('/dashboard/customer')}
              className="flex items-center gap-2 font-bold mb-6 hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <Card className="p-8">
            <h1
                className="font-extrabold mb-8 text-center"
                style={{ fontSize: '32px', fontFamily: 'var(--font-heading)' }}
            >
              {isEditMode ? `Edit ${form.name || 'Dog'}'s Profile` : 'Add Your Dog 🐾'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                  <Input
                      label="Dog's Name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Biscuit"
                      required
                  />
                  <div className="text-right text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {form.name.length} characters
                  </div>
              </div>

              {/* Breed */}
              <div>
                <label className="block font-bold mb-2">Breed</label>
                <input
                    type="text"
                    value={form.breed}
                    onChange={(e) => setForm({ ...form, breed: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="e.g., Golden Retriever"
                    list="breeds"
                />
                <datalist id="breeds">
                  <option value="Golden Retriever" />
                  <option value="Labrador" />
                  <option value="Poodle" />
                  <option value="Doodle" />
                  <option value="German Shepherd" />
                  <option value="Bulldog" />
                  <option value="Chihuahua" />
                  <option value="Shih Tzu" />
                  <option value="Beagle" />
                </datalist>
                <div className="text-right text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {form.breed.length} characters
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block font-bold mb-2">Weight</label>
                <div className="relative">
                  <input
                      type="number"
                      value={form.weight_kg}
                      onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                      className="w-full px-4 py-3 pr-16 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      placeholder="12"
                      min="0"
                      step="0.1"
                  />
                  <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 font-bold"
                      style={{ color: 'var(--color-text-secondary)' }}
                  >
                  kg
                </span>
                </div>
              </div>

              {/* Temperament */}
              <div>
                <label className="block font-bold mb-3">Temperament</label>
                <div className="flex flex-wrap gap-2">
                  {temperamentOptions.map((temp) => (
                      <button
                          key={temp}
                          type="button"
                          onClick={() => toggleTemperament(temp)}
                          className={`px-4 py-2 rounded-full font-bold transition-all ${
                              form.temperament.includes(temp)
                                  ? 'bg-[var(--color-primary)] text-white'
                                  : 'border border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                          }`}
                      >
                        {temp}
                      </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold mb-2">Special Notes</label>
                <textarea
                    value={form.notes}
                    onChange={(e) => {
                      if (e.target.value.length <= 300) {
                        setForm({ ...form, notes: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                    rows={4}
                    placeholder="E.g. sensitive around ears, scared of dryers…"
                    maxLength={300}
                />
                <div className="text-right text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {form.notes.length} / 300
                </div>
              </div>

              {error && (
                  <p className="text-sm font-bold" style={{ color: 'var(--color-error)' }}>
                    {error}
                  </p>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={saving}>
                  {saving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Add Dog'}
                </Button>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard/customer')}
                    className="w-full text-center font-bold py-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
              </div>

              {isEditMode && (
                  <div className="pt-6 border-t border-[var(--color-border)] text-center">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="font-bold hover:underline"
                        style={{ color: 'var(--color-error)' }}
                    >
                      Delete this dog profile
                    </button>
                  </div>
              )}
            </form>
          </Card>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowDeleteModal(false)}
            >
              <Card
                  className="p-8 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                  style={{ boxShadow: '0 16px 64px rgba(0,0,0,0.14)' }}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="font-extrabold mb-2" style={{ fontSize: '24px' }}>
                    Are you sure?
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    This can't be undone. All booking history for <strong>{form.name}</strong> will be lost.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" size="md" onClick={() => setShowDeleteModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="destructive" size="md" onClick={handleDelete} disabled={deleting} className="flex-1">
                    {deleting ? 'Deleting…' : 'Yes, Delete'}
                  </Button>
                </div>
              </Card>
            </div>
        )}
      </div>
  );
}