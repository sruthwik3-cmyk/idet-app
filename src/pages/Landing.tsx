import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, Calendar, ArrowRight, CheckCircle2, Siren, Shield, Lock, Eye } from 'lucide-react';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in page-transition" style={{
            background: '#09090b',
            minHeight: '100vh',
            color: 'white',
            overflowX: 'hidden',
            fontFamily: "'Inter', sans-serif",
            position: 'relative'
        }}>
            {/* Floating Particles */}
            <div className="particle" style={{ top: '10%', left: '5%' }}></div>
            <div className="particle" style={{ top: '30%', left: '90%' }}></div>
            <div className="particle" style={{ top: '70%', left: '10%' }}></div>
            <div className="particle" style={{ top: '85%', left: '80%' }}></div>
            <div className="particle" style={{ top: '50%', left: '50%' }}></div>
            
            {/* Ambient background glows */}
            <div style={{
                position: 'fixed',
                top: '-10%',
                right: '-10%',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                filter: 'blur(100px)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'fixed',
                bottom: '-10%',
                left: '-10%',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                filter: 'blur(100px)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            {/* Navigation Header */}
            <nav className="landing-nav slide-up" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 4%',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                background: 'rgba(9,9,11,0.85)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                {/* Logo + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                    <img
                        src="/idet-logo.svg"
                        alt="IDET Logo"
                        style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    <span className="text-shine" style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>IDET</span>
                </div>

                {/* Nav buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'none', border: 'none',
                            color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem',
                            fontWeight: 500, cursor: 'pointer', padding: '0.4rem 0.6rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#10b981', color: 'white', border: 'none',
                            padding: '0.55rem 1rem', borderRadius: '8px',
                            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                            whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{ position: 'relative', zIndex: 1, padding: '0 5%' }}>
                <div style={{
                    paddingTop: '3rem',
                    paddingBottom: '3rem',
                    textAlign: 'center',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    <div className="bounce-in" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 0.9rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '50px',
                        color: '#818cf8',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: '1.25rem'
                    }}>
                        <Siren size={14} /> New: Synchronized Audio & Gmail Alerts
                    </div>

                    <h1 className="slide-up text-shine" style={{
                        fontSize: 'clamp(2rem, 7vw, 4rem)',
                        fontWeight: 850,
                        lineHeight: 1.1,
                        letterSpacing: '-0.04em',
                        marginBottom: '1rem',
                        background: 'linear-gradient(to bottom right, #fff 50%, rgba(255, 255, 255, 0.6))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Manage Documents <br />
                        <span style={{ color: '#10b981' }}>With Impact.</span>
                    </h1>

                    <p className="zoom-in" style={{
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        lineHeight: 1.6,
                        maxWidth: '600px',
                        margin: '0 auto 1.75rem'
                    }}>
                        Professional document tracking with automated Gmail alerts,
                        perfectly synchronized sound notifications, and seamless calendar integration.
                    </p>

                    <div className="stagger-children" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', padding: '0 1rem' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-pulse btn-scale btn-magnetic btn-ripple"
                            style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2.5rem',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.3s',
                                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)',
                                width: '100%',
                                maxWidth: '320px'
                            }}
                        >
                            Get Started Free <ArrowRight size={20} />
                        </button>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#10b981',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            padding: '0.5rem 1.25rem',
                            background: 'rgba(16, 185, 129, 0.05)',
                            borderRadius: '50px',
                            border: '1px solid rgba(16, 185, 129, 0.1)',
                            whiteSpace: 'nowrap'
                        }}>
                            <Shield size={14} /> Bank-Grade Security
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="stagger-children" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
                    gap: '1.25rem',
                    paddingBottom: '3rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <FeatureCard
                        icon={<Bell color="#f59e0b" />}
                        title="Smart Gmail Alerts"
                        description="Receive automated professional email reminders 30 and 7 days before any document expires."
                    />
                    <FeatureCard
                        icon={<Clock color="#10b981" />}
                        title="Synchronized Audio"
                        description="Visual notifications accompanied by perfectly timed audio alerts for immediate awareness."
                    />
                    <FeatureCard
                        icon={<Calendar color="#6366f1" />}
                        title="Calendar Sync"
                        description="One-click integration to add your document expiries directly to your Google Calendar."
                    />
                </div>

                {/* Trust Section */}
                <div style={{ textAlign: 'center', paddingBottom: '3rem' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
                        Designed for Professional Organization
                    </p>
                    <div className="landing-trust-row" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '4rem',
                        opacity: 0.6,
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={20} color="#10b981" /> <span>Secure Auth</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={20} color="#10b981" /> <span>Cloud Sync</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={20} color="#10b981" /> <span>Category Focused</span>
                        </div>
                    </div>
                </div>

                {/* Security & Trust Section */}
                <div id="security-section" style={{ padding: '2rem 0 3rem', textAlign: 'center' }}>
                    <div className="slide-up" style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)',
                        padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)',
                        borderRadius: '24px',
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <Shield size={28} color="#10b981" />
                                <Lock size={28} color="#10b981" />
                                <Eye size={28} color="#10b981" />
                            </div>
                            <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                                Your Safety is Our <span style={{ color: '#10b981' }}>Core Mission.</span>
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                                IDET uses bank-grade HTTPS encryption, Row Level Security so only you see your data, Google OAuth 2.0 login, and automated rate-limiting. Your documents are never shared.
                            </p>
                            <button
                                onClick={() => navigate('/privacy')}
                                style={{
                                    background: 'rgba(255,255,255,0.05)', color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '0.75rem 1.75rem', borderRadius: '10px',
                                    fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'
                                }}
                            >
                                Read Our Privacy Policy →
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                padding: '2rem 5%',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.9rem'
            }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <button 
                        onClick={() => navigate('/privacy')}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseOver={(e: React.MouseEvent) => (e.currentTarget as HTMLButtonElement).style.color = 'white'}
                        onMouseOut={(e: React.MouseEvent) => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255, 255, 255, 0.4)'}
                    >
                        Privacy Policy
                    </button>
                    <button 
                        onClick={() => navigate('/privacy')}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseOver={(e: React.MouseEvent) => (e.currentTarget as HTMLButtonElement).style.color = 'white'}
                        onMouseOut={(e: React.MouseEvent) => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255, 255, 255, 0.4)'}
                    >
                        Terms of Service
                    </button>
                    <a 
                        href="mailto:sriperambudururuthwik@gmail.com"
                        style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
                        onMouseOver={(e: React.MouseEvent) => (e.currentTarget as HTMLAnchorElement).style.color = 'white'}
                        onMouseOut={(e: React.MouseEvent) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255, 255, 255, 0.4)'}
                    >
                        Contact Support
                    </a>
                </div>
                <p>© {new Date().getFullYear()} IDET Document Manager. All rights reserved.</p>
            </footer>

            <style>{`
                .btn-pulse {
                    animation: pulse-emerald 2s infinite;
                }
                @keyframes pulse-emerald {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="card-3d hover-lift gradient-border" style={{
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        transition: 'all 0.3s'
    }}
        onMouseOver={(e: React.MouseEvent) => {
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.04)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
        }}
        onMouseOut={(e: React.MouseEvent) => {
            (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.02)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.05)';
            (e.currentTarget as HTMLDivElement).style.transform = 'none';
        }}
    >
        <div className="pulse-ring icon-bounce" style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
        }}>
            {icon}
        </div>
        <h3 className="zoom-in" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>{title}</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.6, fontSize: '0.95rem' }}>{description}</p>
    </div>
);

export default Landing;
