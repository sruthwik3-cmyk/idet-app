import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Login: React.FC = () => {
    // We don't really need updateUserProfile from context anymore for login, 
    // as AppContext will fetch it from Supabase auth state.
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-redirect if already logged in
    React.useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                console.log("[Login] Found existing session, redirecting to dashboard...");
                navigate('/dashboard');
            }
        };
        checkSession();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // AppContext will detect auth change and redirect logic can happen there or here
                navigate('/dashboard');
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin + '/dashboard',
                        data: {
                            full_name: 'New User',
                        },
                    },
                });
                if (error) throw error;
                if (data.session) {
                    navigate('/setup-profile');
                } else {
                    alert('Check your email for the confirmation link!');
                }
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            let errorMessage = err.message || 'An error occurred';

            // Check for rate limit error
            if (errorMessage.toLowerCase().includes('rate limit')) {
                errorMessage = "Email signup limit reached (common on shared Wi-Fi). Please use 'Continue with Google' instead - it works instantly!";
                // Optional: You could also automatically trigger Google login here, but it's better to let the user choose.
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            console.log("[Login] Starting Google OAuth flow...");
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });
            if (error) {
                console.error("[Login] OAuth dispatch failed:", error.message);
                throw error;
            }
            console.log("[Login] OAuth flow dispatched to browser.");
        } catch (error: any) {
            console.error('Google Login Error:', error);
            setError(`Google Login Failed: ${error.message || 'Unknown error'}. Check console for details.`);
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{
            display: 'grid',
            placeItems: 'center',
            minHeight: '100vh',
            width: '100vw',
            padding: '2rem 1rem',
            position: 'relative',
            background: 'var(--background)',
            overflowX: 'hidden',
            overflowY: 'auto'
        }}>
            {/* Ambient Background Effects */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
                zIndex: 0,
                filter: 'blur(60px)',
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
                zIndex: 0,
                filter: 'blur(60px)',
            }}></div>

            {/* Main Card Container */}
            <div className="card" style={{
                width: '95%',
                maxWidth: '480px',
                margin: '1rem',
                padding: '0',
                position: 'relative',
                zIndex: 10,
                border: '1px solid var(--border)',
                background: 'var(--card-bg)',
                backdropFilter: 'var(--glass)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{ padding: '3rem 2.5rem' }}>
                    {/* Header Section */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 10px 15px -3px var(--primary-glow)'
                        }}>
                            <Shield size={32} color="white" />
                        </div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            color: 'white'
                        }}>
                            IDET
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Important Documents Expiry Tracker
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {error && (
                            <div style={{ padding: '0.75rem', background: 'rgba(248, 113, 113, 0.2)', color: '#fca5a5', borderRadius: '8px', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        {/* Google Login Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.03)',
                                color: 'white',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                            OR
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Email Address</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    transition: 'all 0.2s',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary-full btn-pulse"
                            disabled={loading}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    marginLeft: '0.25rem'
                                }}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Login;
