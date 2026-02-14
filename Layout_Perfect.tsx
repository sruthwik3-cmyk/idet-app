import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Bell,
    User,
    LogOut,
    PlusCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import VoiceOrb from './VoiceOrb';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { unlockAudioContext } from '../utils/soundUtils';

interface LayoutProps {
    children: ReactNode;
    hideSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideSidebar = false }) => {
    const { userProfile, notification } = useApp();
    const navigate = useNavigate();
    const { isListening, isSpeaking, toggleListening } = useVoiceAssistant();

    // Global listener to unlock audio context on first interaction
    React.useEffect(() => {
        const unlock = () => {
            unlockAudioContext();
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
            document.removeEventListener('touchstart', unlock);
        };

        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
        document.addEventListener('touchstart', unlock);

        return () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
            document.removeEventListener('touchstart', unlock);
        };
    }, []);

    if (hideSidebar) {
        return <div className="layout-minimal">{children}</div>;
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: CalendarIcon, label: 'Calendar', path: '/calendar' },
        { icon: Bell, label: 'Alerts & History', path: '/alerts' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>IDET</h2>
                    <p>Doc Tracker</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className="btn-primary-full btn-pulse"
                        onClick={() => navigate('/add-document')}
                    >
                        <PlusCircle size={20} /> <span style={{ fontWeight: 600 }}>New Document</span>
                    </button>

                    <ul>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-mini-profile">
                        <div className="avatar">
                            {userProfile?.fullName?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
                        </div>
                        <div className="user-info">
                            <span className="name">{userProfile?.fullName || 'Guest User'}</span>
                            <span className="email">{userProfile?.email || 'No Email'}</span>
                        </div>
                    </div>
                    <button
                        className="btn-logout"
                        onClick={async () => {
                            await import('../utils/supabaseClient').then(m => m.supabase.auth.signOut());
                            navigate('/');
                        }}
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>

            {/* Mobile FAB */}
            <button
                className="fab-mobile"
                onClick={() => navigate('/add-document')}
                aria-label="Add Document"
            >
                <PlusCircle size={24} />
            </button>

            <VoiceOrb isListening={isListening} isSpeaking={isSpeaking} toggleListening={toggleListening} />

            {/* Notification Toast */}
            {notification && (
                <div className={`notification-toast ${notification.type}`} style={{
                    position: 'fixed',
                    top: '30px',
                    right: '30px',
                    padding: '1.25rem 2rem',
                    borderRadius: '16px',
                    background: 'rgba(10, 0, 40, 0.95)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 10px 40px rgba(124, 58, 237, 0.3)',
                    zIndex: 9999,
                    animation: 'fadeInUp 0.4s var(--bounce) forwards'
                }}>
                    <div style={{
                        background: 'var(--primary-soft)',
                        padding: '0.6rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Bell size={22} color="#c084fc" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.01em' }}>System Alert</span>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-dim)' }}>{notification.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
