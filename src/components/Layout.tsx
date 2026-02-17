import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar as CalendarIcon,
    Bell,
    User,
    LogOut,
    PlusCircle,
    FileText
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
        { icon: FileText, label: 'Document Files', path: '/files' },
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
                        className="btn-primary-full"
                        onClick={() => navigate('/add-document')}
                        style={{
                            boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)'
                        }}
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
                    top: '20px',
                    right: '20px',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    background: 'rgba(30, 41, 59, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    zIndex: 9999,
                }}>
                    <Bell size={20} color="var(--primary)" />
                    <span style={{ fontWeight: 500 }}>{notification.message}</span>
                </div>
            )}
        </div>
    );
};

export default Layout;
