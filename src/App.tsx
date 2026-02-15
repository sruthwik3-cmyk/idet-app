import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Landing from './pages/Landing';
import SetupProfile from './pages/SetupProfile';
import AddDocument from './pages/AddDocument';
import Alerts from './pages/Alerts';
import UserSettings from './pages/UserSettings';
import CalendarView from './pages/CalendarView';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { userProfile, loading } = useApp();

    // While loading auth state, show nothing or a splash screen
    if (loading) {
        return (
            <div style={{
                height: '100vh',
                background: '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'sans-serif'
            }}>
                <div className="animate-pulse">Loading IDET...</div>
            </div>
        );
    }

    if (!userProfile) {
        // Double check session to prevent accidental login-loops during slow profile loads
        return <Navigate to="/login" replace />;
    }

    // If profile exists but is missing essential info, force setup
    if (!userProfile.fullName || !userProfile.userGroup) {
        return <Navigate to="/setup-profile" replace />;
    }

    return <Layout>{children}</Layout>;
};

function AppRoutes() {
    const { userProfile } = useApp();

    return (
        <Routes>
            <Route path="/" element={userProfile ? <Navigate to="/dashboard" replace /> : <Landing />} />
            <Route path="/login" element={userProfile ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/setup-profile" element={<Layout hideSidebar><SetupProfile /></Layout>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/add-document" element={<ProtectedRoute><AddDocument /></ProtectedRoute>} />
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
                <Router>
                    <AppRoutes />
                </Router>
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;
