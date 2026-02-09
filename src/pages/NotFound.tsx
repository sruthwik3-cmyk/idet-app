import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{
                position: 'relative',
                marginBottom: '2rem'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    filter: 'blur(60px)',
                    opacity: 0.2
                }}></div>
                <AlertCircle size={80} color="var(--text-secondary)" />
            </div>

            <h1 style={{ fontSize: '4rem', margin: 0, fontWeight: 800, lineHeight: 1 }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>Page Not Found</h2>
            <p style={{ maxWidth: '400px', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary-full btn-pulse"
                style={{ width: 'auto', padding: '0.75rem 2rem', gap: '0.75rem' }}
            >
                <Home size={20} />
                Go to Dashboard
            </button>
        </div>
    );
};

export default NotFound;
