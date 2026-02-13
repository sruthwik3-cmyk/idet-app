import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, Clock, Calendar, ArrowRight, CheckCircle2, Siren, ChevronDown } from 'lucide-react';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinkStyle = {
        background: 'none',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.9rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        textDecoration: 'none'
    };

    const handleHover = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.color = 'white';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
    };

    const handleUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
        e.currentTarget.style.background = 'none';
    };

    return (
        <div style={{
            background: 'var(--background)',
            minHeight: '100vh',
            color: 'var(--text-primary)',
            overflowX: 'hidden',
            fontFamily: "'Outfit', 'Inter', sans-serif"
        }}>
            {/* Grainy Texture Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 50,
                opacity: 0.03,
                background: 'url("https://grainy-gradients.vercel.app/noise.svg")',
            }}></div>

            {/* Ambient Animated Background */}
            <div className="ambient-glow" style={{
                position: 'fixed',
                top: '-20%',
                right: '-10%',
                width: '70vw',
                height: '70vw',
                background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
                filter: 'blur(120px)',
                zIndex: 0,
                pointerEvents: 'none',
                animation: 'float-glow 20s infinite alternate'
            }}></div>
            <div className="ambient-glow-2" style={{
                position: 'fixed',
                bottom: '-20%',
                left: '-10%',
                width: '80vw',
                height: '80vw',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                filter: 'blur(120px)',
                zIndex: 0,
                pointerEvents: 'none',
                animation: 'float-glow 25s infinite alternate-reverse'
            }}></div>

            {/* Navigation Header */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: scrolled ? '1rem 5%' : '1.5rem 5%',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                background: scrolled ? 'rgba(9, 9, 11, 0.8)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                        padding: '10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px -4px var(--primary-glow)'
                    }}>
                        <Shield size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(to bottom, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        IDET
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="nav-links">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={navLinkStyle} onMouseEnter={handleHover} onMouseLeave={handleUnhover}>Home</button>
                    <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={navLinkStyle} onMouseEnter={handleHover} onMouseLeave={handleUnhover}>About</button>
                    <button onClick={() => document.getElementById('help')?.scrollIntoView({ behavior: 'smooth' })} style={navLinkStyle} onMouseEnter={handleHover} onMouseLeave={handleUnhover}>Help</button>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 0.5rem' }}></div>
                    <button onClick={() => navigate('/login')} style={navLinkStyle} onMouseEnter={handleHover} onMouseLeave={handleUnhover}>Login</button>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary-glass"
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            boxShadow: '0 0 20px var(--primary-glow)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{ position: 'relative', zIndex: 10, padding: '0 5%' }}>
                <section style={{
                    paddingTop: '12rem',
                    paddingBottom: '10rem',
                    textAlign: 'center',
                    maxWidth: '1000px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }} className="reveal">
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1.25rem',
                        background: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        borderRadius: '100px',
                        color: '#a5b4fc',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginBottom: '3rem',
                        backdropFilter: 'blur(10px)',
                        boxShadow: 'inset 0 0 12px rgba(99, 102, 241, 0.05)'
                    }}>
                        <Siren size={16} className="pulse-slow" /> New: Intelligent Sync & Gmail Engine
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 5.5rem)',
                        fontWeight: 950,
                        lineHeight: 0.95,
                        letterSpacing: '-0.06em',
                        marginBottom: '2rem',
                        background: 'linear-gradient(to bottom, #ffffff 30%, var(--primary) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
                    }}>
                        Important Document <br />
                        <span style={{ color: 'var(--primary)', textShadow: '0 0 40px var(--primary-glow)' }}>Expiry Tracker.</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        lineHeight: 1.5,
                        maxWidth: '700px',
                        margin: '0 auto 4rem',
                        fontWeight: 400
                    }}>
                        The ultimate high-fidelity tracker for your critical documents. <br />
                        Automated Gmail alerts, synchronized audio, and smart calendar engine.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-primary-full btn-pulse"
                            style={{
                                width: 'auto',
                                padding: '1.25rem 3rem',
                                borderRadius: '16px',
                                fontSize: '1.2rem'
                            }}
                        >
                            Get Started Free <ArrowRight size={24} />
                        </button>
                    </div>

                    <div style={{ marginTop: '8rem', opacity: 0.5 }}>
                        <ChevronDown size={32} className="bounce-slow" />
                    </div>
                </section>

                {/* About Section */}
                <section id="features" style={{
                    paddingTop: '6rem',
                    paddingBottom: '10rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '6rem' }} className="reveal">
                        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '1rem' }}>The System</h2>
                        <h3 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>Engineered for Perfection</h3>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '2.5rem'
                    }}>
                        <FeatureCard
                            icon={<Bell color="var(--warning)" size={32} />}
                            title="Active Gmail Integration"
                            description="Deep integration with Gmail to ensure your alerts land directly in your primary inbox, keeping you informed across all devices."
                            delay="0s"
                        />
                        <FeatureCard
                            icon={<Clock color="var(--success)" size={32} />}
                            title="Critical Audio Sync"
                            description="Custom audio-visual feedback loops that synchronize with your high-priority document statuses for zero-friction management."
                            delay="0.1s"
                        />
                        <FeatureCard
                            icon={<Calendar color="var(--primary)" size={32} />}
                            title="Engineered Calendar Fix"
                            description="Instant generation of ICS payloads allowing for seamless one-click synchronization with your global cloud calendar."
                            delay="0.2s"
                        />
                    </div>
                </section>

                {/* Trust & Status */}
                <section style={{
                    paddingBottom: '12rem',
                    textAlign: 'center'
                }} className="reveal">
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '32px',
                        padding: '4rem 2rem',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 0 0 32px rgba(255, 255, 255, 0.01)'
                    }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.3em', marginBottom: '4rem', fontWeight: 700 }}>Built for Reliable Operations</p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '5rem',
                            opacity: 0.7,
                            flexWrap: 'wrap'
                        }}>
                            <TrustBadge label="256-bit AES Encryption" />
                            <TrustBadge label="99.9% Alert Reliability" />
                            <TrustBadge label="Real-time Cloud Sync" />
                        </div>
                    </div>
                </section>

                {/* Help / FAQ Section */}
                <section id="help" style={{
                    paddingBottom: '12rem',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="reveal">
                        <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Capabilities & Support</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <FAQItem
                            question="How do the automated alerts behave?"
                            answer="Our system executes a cold-start check daily, dispatching high-priority headers to your Gmail exactly 30 and 7 days before expiration. This is coupled with local audio-visual triggers for immediate visibility."
                        />
                        <FAQItem
                            question="Is the calendar engine bidirectional?"
                            answer="Currently, IDET pushes precision event markers to Google Calendar. This ensures your expiration schedule exists outside the application context for maximum resilience."
                        />
                        <FAQItem
                            question="What protocols protect my documents?"
                            answer="We leverage Supabase's secure infrastructure with Row Level Security (RLS). Every document entry is encrypted at rest and tied exclusively to your authenticated UID."
                        />
                    </div>
                </section>
            </main>

            {/* Cinematic Footer */}
            <footer style={{
                padding: '6rem 5% 4rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                textAlign: 'center',
                background: 'linear-gradient(to bottom, transparent, rgba(9, 9, 11, 0.5))'
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                    <Shield size={20} color="#10b981" />
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>IDET</span>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                    The world's most reliable document expiry engine. <br />
                    Engineered by professionals, for professionals.
                </p>
                <div style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                    © {new Date().getFullYear()} IDET INFRASTRUCTURES. ALL RIGHTS RESERVED.
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&display=swap');

                .btn-main-pulse {
                    position: relative;
                }
                .btn-main-pulse::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    border-radius: 14px;
                    background: #10b981;
                    opacity: 0.3;
                    z-index: -1;
                    animation: main-pulse 2s cubic-bezier(0.24, 0, 0.22, 1) infinite;
                }

                @keyframes main-pulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.4); opacity: 0; }
                }

                @keyframes float-glow {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(-10%, 10%) scale(1.1); }
                }

                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(15px); }
                }

                .bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }

                .pulse-slow {
                    animation: inner-pulse 2s infinite ease-in-out;
                }

                @keyframes inner-pulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }

                .reveal {
                    animation: reveal-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes reveal-up {
                    from { opacity: 0; transform: translateY(40px); filter: blur(10px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }

                .btn-primary-glass:hover {
                    box-shadow: 0 0 30px rgba(16, 185, 129, 0.4) !important;
                    transform: translateY(-2px);
                    background: #059669 !important;
                }

                * {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) => (
    <div style={{
        padding: '3rem 2.5rem',
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        borderRadius: '32px',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'default',
        animation: `reveal-up 1.2s ${delay} cubic-bezier(0.16, 1, 0.3, 1) forwards`,
        opacity: 0,
        backdropFilter: 'blur(10px)',
    }}
        className="feature-card"
        onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 30px 60px -15px rgba(0,0,0,0.5)';
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            boxShadow: 'inset 0 0 12px rgba(255,255,255,0.05)'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.25rem', color: 'white', letterSpacing: '-0.02em' }}>{title}</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.7, fontSize: '1rem', fontWeight: 400 }}>{description}</p>
    </div>
);

const TrustBadge = ({ label }: { label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '100px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <CheckCircle2 size={20} color="#10b981" />
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
    </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <div style={{
        padding: '2.5rem',
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        borderRadius: '24px',
        transition: 'all 0.3s ease'
    }}
        onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.01)';
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
        }}
    >
        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: '#10b981', letterSpacing: '-0.02em' }}>{question}</h4>
        <p style={{ color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.7, fontSize: '1.05rem', margin: 0, fontWeight: 400 }}>{answer}</p>
    </div>
);

export default Landing;
