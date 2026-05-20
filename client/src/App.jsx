import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './app/hooks/AuthContext.tsx';

// Public Pages
import { HomePage } from './app/pages/HomePage.tsx';
import { AboutPage } from './app/pages/AboutPage.tsx';
import { GalleryPage } from './app/pages/GalleryPage.tsx';
import { SignUpPage } from './app/pages/SignUpPage.tsx';
import { LoginPage } from './app/pages/LoginPage.tsx';
import { GroomerListingPage } from './app/pages/GroomerListingPage.tsx';
import { GroomerPublicProfile } from './app/pages/GroomerPublicProfile.tsx';
import {ServicesPage} from "@/app/pages/ServicesPage.tsx";

// Protected Pages
import { CustomerDashboard } from './app/pages/CustomerDashboard.tsx';
import { DogProfilePage } from './app/pages/DogProfilePage.tsx';
import { BookingFlow } from './app/pages/BookingFlow.tsx';
import { GroomerDashboard } from './app/pages/GroomerDashboard.tsx';
import { AdminPanel } from './app/pages/AdminPanel.tsx';

// Placeholder for pages not yet built
function ComingSoon({ page }) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--color-surface)',
            fontFamily: 'var(--font-body)',
        }}>
            <div style={{ fontSize: '64px' }}>🐾</div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '32px' }}>
                {page}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Coming soon...</p>
        </div>
    );
}

/** Redirects unauthenticated users to /login */
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

/** Redirects non-CLIENT users away from client-specific routes */
function ClientRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'CLIENT') return <Navigate to="/dashboard/groomer" replace />;
    return <>{children}</>;
}

/** Redirects non-GROOMER users away from groomer-specific routes */
function GroomerRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'GROOMER' && user.role !== 'ADMIN') return <Navigate to="/dashboard/customer" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* ── Public Routes ── */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/services" element={<ServicesPage />} />

                    {/* ── Groomer Discovery (public) ── */}
                    <Route path="/groomers" element={<GroomerListingPage />} />
                    <Route path="/groomers/:id" element={<GroomerPublicProfile />} />

                    <Route path="/services" element={<ComingSoon page="Services" />} />
                    <Route path="/contact" element={<ComingSoon page="Contact" />} />

                    {/* ── Customer Dashboard ── */}
                    <Route
                        path="/dashboard/customer"
                        element={
                            <ProtectedRoute>
                                <ClientRoute>
                                    <CustomerDashboard />
                                </ClientRoute>
                            </ProtectedRoute>
                        }
                    />

                    {/* ── Dog Profile: Add New ── */}
                    <Route
                        path="/dashboard/dogs/new"
                        element={
                            <ProtectedRoute>
                                <ClientRoute>
                                    <DogProfilePage />
                                </ClientRoute>
                            </ProtectedRoute>
                        }
                    />

                    {/* ── Dog Profile: Edit Existing ── */}
                    <Route
                        path="/dashboard/dogs/:id/edit"
                        element={
                            <ProtectedRoute>
                                <ClientRoute>
                                    <DogProfilePage />
                                </ClientRoute>
                            </ProtectedRoute>
                        }
                    />

                    {/* ── Booking Flow ── */}
                    <Route
                        path="/book/:groomerId"
                        element={
                            <ProtectedRoute>
                                <ClientRoute>
                                    <BookingFlow />
                                </ClientRoute>
                            </ProtectedRoute>
                        }
                    />

                    {/* ── Groomer Dashboard ── */}
                    <Route
                        path="/dashboard/groomer"
                        element={
                            <ProtectedRoute>
                                <GroomerRoute>
                                    <GroomerDashboard />
                                </GroomerRoute>
                            </ProtectedRoute>
                        }
                    />

                    {/* ── Admin ── */}
                    <Route path="/dashboard/admin" element={
                            <ProtectedRoute>
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />

                    {/* ── Fallback ── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}