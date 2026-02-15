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
    const { userProfile, loading, session } = useApp();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && !session && !userProfile) {
            navigate('/login');
        }
    }, [userProfile, loading, session, navigate]);

    if (loading) {
        return <div style={{ height: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="animate-pulse text-white">Loading...</div></div>;
    }

    if (!session && !userProfile) {
        return null;
    }

    if (userProfile && !userProfile.fullName && window.location.pathname !== '/setup-profile') {
        return <Navigate to="/setup-profile" replace />;
    }

    return <Layout>{children}</Layout>;
};

function AppRoutes() {
    const { userProfile } = useApp();

    return (
        <Routes>
            <Route path="/" element={(userProfile && session) ? <Navigate to="/dashboard" replace /> : <Landing />} />
            <Route path="/login" element={(userProfile && session) ? <Navigate to="/dashboard" replace /> : <Login />} />
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
