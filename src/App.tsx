import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import { unlockAudioContext } from './utils/soundUtils';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Landing from './pages/Landing';
import SetupProfile from './pages/SetupProfile';
import AddDocument from './pages/AddDocument';
import Alerts from './pages/Alerts';
import UserSettings from './pages/UserSettings';
import CalendarView from './pages/CalendarView';
import DocumentFiles from './pages/DocumentFiles';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { loading, session, userProfile } = useApp();

    if (loading) {
        return <div style={{ height: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="animate-pulse text-white">Loading...</div></div>;
    }

    if (!session) {
        const search = window.location.search;
        return <Navigate to={`/login${search}`} replace />;
    }

    if (userProfile && !userProfile.fullName && window.location.pathname !== '/setup-profile') {
        return <Navigate to="/setup-profile" replace />;
    }

    return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
    const { session, loading } = useApp();
    const navigate = useNavigate();
    const location = window.location.pathname;
    const [forceShowApp, setForceShowApp] = React.useState(false);

    // EMERGENCY: Force show app after 5 seconds if still loading
    React.useEffect(() => {
        const emergencyTimer = setTimeout(() => {
            if (loading) {
                console.error('[App] EMERGENCY: Forcing app to show after 5 seconds');
                setForceShowApp(true);
            }
        }, 5000);

        return () => clearTimeout(emergencyTimer);
    }, [loading]);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') && location !== '/login') {
            console.log("[AppRoutes] Error detected in URL, redirecting to login...");
            navigate('/login' + window.location.search, { replace: true });
            return;
        }

        if (!loading && session && (location === '/' || location === '/login')) {
            console.log("[AppRoutes] User has session, redirecting to dashboard...");
            navigate('/dashboard', { replace: true });
        }
    }, [session, loading, location, navigate]);

    // Show loading screen only if not forced and still loading
    if (loading && !forceShowApp) return (
        <div style={{ height: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-pulse text-white">Initializing IDET...</div>
        </div>
    );

    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/setup-profile" element={<Layout hideSidebar><SetupProfile /></Layout>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/add-document" element={<ProtectedRoute><AddDocument /></ProtectedRoute>} />
            <Route path="/files" element={<ProtectedRoute><DocumentFiles /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <div onClick={() => unlockAudioContext()} style={{ minHeight: '100vh' }}>
                    <Router>
                        <AppRoutes />
                    </Router>
                </div>
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;
