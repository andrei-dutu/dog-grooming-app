import { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuth } from '../hooks/AuthContext';

interface SettingsPageProps {
  userType: 'customer' | 'groomer' | 'admin';
}

const API_BASE = '/api';

export function SettingsPage({ userType }: SettingsPageProps) {
  const { user, token, logout } = useAuth();

  // ── Personal Info ──────────────────────────────────────────────
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Password ───────────────────────────────────────────────────
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Delete Account ─────────────────────────────────────────────
  const [deleteText, setDeleteText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ── Load profile on mount ──────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        let endpoint: string;

        if (userType === 'customer') {
          endpoint = `${API_BASE}/customer-profiles`;
        } else {
          // Pentru groomer, trebuie să obținem profilul din userId
          // Mai întâi obținem user-ul curent cu /auth/me
          // sau apelăm direct endpoint-ul care returnează profilul groomer-ului
          // cel mai simplu: trebuie API care să returneze groomer profile de user curent

          // Alternativ: facem query direct cu Prisma - dar asta nu e ideal
          // Soluția: creezi un endpoint /groomer-profiles/me ca groomer-ul curent
          endpoint = `${API_BASE}/groomer-profiles/me`;
        }

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();

        const profile = Array.isArray(data) ? data[0] : data;
        setProfileId(profile.id);
        setPersonalInfo({
          firstName: profile.first_name ?? profile.display_name?.split(' ')[0] ?? '',
          lastName: profile.last_name ?? profile.display_name?.split(' ').slice(1).join(' ') ?? '',
          email: user?.email ?? '',
          phone: profile.phone ?? '',
        });
      } catch {
        setSaveError('Could not load profile.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token, userType, user?.email]);

  // ── Save personal info ─────────────────────────────────────────
  const handleSavePersonalInfo = async () => {
    if (!profileId || !token) return;
    setSaveError('');
    setSaveSuccess(false);

    const endpoint =
        userType === 'customer'
            ? `${API_BASE}/customer-profiles/${profileId}`
            : `${API_BASE}/groomer-profiles/${profileId}`;

    const body =
        userType === 'customer'
            ? { first_name: personalInfo.firstName, last_name: personalInfo.lastName, phone: personalInfo.phone }
            : { display_name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(), phone: personalInfo.phone };

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Update failed');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message ?? 'Something went wrong');
    }
  };

  // ── Change password ────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setPasswordError('All fields are required.');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      // Verify current password by re-authenticating
      const verifyRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: personalInfo.email, password: passwordData.current }),
      });

      if (!verifyRes.ok) {
        throw new Error('Current password is incorrect.');
      }

      // Update to new password via users endpoint (ADMIN-only in normal CRUD,
      // but we're authenticated and this passes through beforeUpdate → hashPasswordIfPresent)
      const res = await fetch(`${API_BASE}/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwordData.new }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Password update failed');
      }

      setPasswordSuccess(true);
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message ?? 'Something went wrong');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Delete account ─────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE' || !user?.id || !token) return;
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Delete failed');
      }

      logout();
    } catch (err: any) {
      setDeleteError(err.message ?? 'Something went wrong');
      setDeleteLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: '#FCA5A5' };
    if (password.length < 10) return { strength: 2, label: 'Fair', color: '#FDBA74' };
    if (password.length < 14) return { strength: 3, label: 'Good', color: '#FDE68A' };
    return { strength: 4, label: 'Strong', color: 'var(--color-accent)' };
  };

  const passwordStrength = getPasswordStrength(passwordData.new);

  if (loadingProfile) {
    return (
        <div className="max-w-3xl mx-auto py-12 text-center" style={{ color: 'var(--color-text-secondary)' }}>
          <div
              className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          />
          Loading profile…
        </div>
    );
  }

  return (
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ── Section 1: Personal Information ── */}
        <div>
          <h2 className="font-extrabold mb-4" style={{ fontSize: '20px' }}>
            {userType === 'admin' ? 'Admin Account' : userType === 'groomer' ? 'Profile Information' : 'Personal Information'}
          </h2>
          <div className="border-t border-[var(--color-border)] pt-6">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                    label="First Name"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                />
                <Input
                    label="Last Name"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                />
              </div>

              <div>
                <Input
                    label="Email Address"
                    value={personalInfo.email}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Email cannot be changed
                </p>
              </div>

              <Input
                  label="Phone Number"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
              />

              {saveError && (
                  <p className="text-sm font-bold" style={{ color: 'var(--color-error)' }}>{saveError}</p>
              )}

              <div className="flex items-center gap-3 justify-end">
                {saveSuccess && (
                    <span className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                  ✓ Profile updated
                </span>
                )}
                <Button variant="primary" size="md" onClick={handleSavePersonalInfo}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Change Password ── */}
        <div>
          <h2 className="font-extrabold mb-4" style={{ fontSize: '20px' }}>
            Change Password
          </h2>
          <div className="border-t border-[var(--color-border)] pt-6">
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block font-bold mb-2">Current Password</label>
                <div className="relative">
                  <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="w-full px-4 py-3 pr-12 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-bold mb-2">New Password</label>
                <div className="relative">
                  <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="w-full px-4 py-3 pr-12 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordData.new && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-1 flex-1 rounded-full transition-all"
                                style={{
                                  backgroundColor: i <= passwordStrength.strength ? passwordStrength.color : '#E5E7EB',
                                }}
                            />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </p>
                    </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-bold mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="w-full px-4 py-3 pr-12 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {passwordError && (
                  <p className="text-sm font-bold" style={{ color: 'var(--color-error)' }}>{passwordError}</p>
              )}

              <div className="flex items-center gap-3 justify-end">
                {passwordSuccess && (
                    <span className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                  ✓ Password updated
                </span>
                )}
                <Button variant="primary" size="md" onClick={handleChangePassword} disabled={passwordLoading}>
                  {passwordLoading ? 'Updating…' : 'Update Password'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Danger Zone / Account Status ── */}
        {userType === 'customer' && (
            <div>
              <h2 className="font-extrabold mb-4" style={{ fontSize: '20px', color: 'var(--color-error)' }}>
                Danger Zone
              </h2>
              <div
                  className="border-t-2 pt-6 rounded-2xl"
                  style={{ borderColor: 'var(--color-error)', backgroundColor: '#FFF5F5' }}
              >
                <div className="p-6">
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    This action is permanent and cannot be undone. All your bookings and dog profiles will be deleted.
                  </p>
                  <Button variant="destructive" size="md" onClick={() => setShowDeleteModal(true)}>
                    Delete My Account
                  </Button>
                </div>
              </div>
            </div>
        )}

        {userType === 'groomer' && (
            <div>
              <h2 className="font-extrabold mb-4" style={{ fontSize: '20px' }}>
                Account Status
              </h2>
              <div className="border-t border-[var(--color-border)] pt-6">
                <Card className="p-4 bg-gray-50">
                  <p className="mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    Your account is managed by the salon admin. To deactivate your account, contact your admin.
                  </p>
                  <Button variant="ghost" size="sm">
                    Contact Admin
                  </Button>
                </Card>
              </div>
            </div>
        )}

        {/* ── Delete Account Modal ── */}
        {showDeleteModal && (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => { setShowDeleteModal(false); setDeleteText(''); setDeleteError(''); }}
            >
              <Card
                  className="p-8 max-w-md w-full text-center"
                  onClick={(e) => e.stopPropagation()}
              >
                <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: '#FDE68A' }} />
                <h3 className="font-extrabold mb-4" style={{ fontSize: '24px' }}>Are you sure?</h3>
                <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Type <strong>DELETE</strong> to confirm. This cannot be undone.
                </p>
                <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-4 py-3 mb-4 rounded-2xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-error)]"
                />
                {deleteError && (
                    <p className="text-sm font-bold mb-3" style={{ color: 'var(--color-error)' }}>{deleteError}</p>
                )}
                <div className="flex gap-3">
                  <Button
                      variant="ghost"
                      size="md"
                      onClick={() => { setShowDeleteModal(false); setDeleteText(''); setDeleteError(''); }}
                      className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                      variant="destructive"
                      size="md"
                      onClick={handleDeleteAccount}
                      disabled={deleteText !== 'DELETE' || deleteLoading}
                      className="flex-1"
                  >
                    {deleteLoading ? 'Deleting…' : 'Delete Account'}
                  </Button>
                </div>
              </Card>
            </div>
        )}
      </div>
  );
}