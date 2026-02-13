import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, Clock, Calendar, ArrowRight, CheckCircle2, Siren } from 'lucide-react';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    const navLinkStyle = {
        background: 'none',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.95rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'color 0.2s',
        padding: '0.5rem 0'
    };

    return (
        <div className="animate-fade-in" style={{
            background: '#09090b',
            minHeight: '100vh',
            color: 'white',
            overflowX: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
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
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 5%',
                position: 'relative',
                zIndex: 10,
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                top: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        padding: '8px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Shield size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>IDET</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={navLinkStyle}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => {
                            const features = document.getElementById('features');
                            features?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={navLinkStyle}
                    >
                        About
                    </button>
                    <button
                        onClick={() => window.open('mailto:support@idet.app')}
                        style={navLinkStyle}
                    >
                        Help
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={navLinkStyle}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '0.6rem 1.25rem',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.backgroundColor = '#059669';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.backgroundColor = '#10b981';
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{ position: 'relative', zIndex: 1, padding: '0 5%' }}>
                <div style={{
                    paddingTop: '6rem',
                    paddingBottom: '8rem',
                    textAlign: 'center',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '50px',
                        color: '#818cf8',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginBottom: '2rem'
                    }}>
                        <Siren size={14} /> New: Synchronized Audio & Gmail Alerts
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                        fontWeight: 850,
                        lineHeight: 1.1,
                        letterSpacing: '-0.04em',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to bottom right, #fff 50%, rgba(255, 255, 255, 0.6))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Never Miss a <br />
                        <span style={{ color: '#10b981' }}>Document Renewal.</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1.1rem, 3vw, 1.25rem)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        lineHeight: 1.6,
                        maxWidth: '650px',
                        margin: '0 auto 3rem'
                    }}>
                        The ultimate tracker for your critical documents. Get automated Gmail alerts,
                        synchronized audio reminders, and effortless calendar integration.
                    </p>

                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-pulse"
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
                                gap: '0.75rem',
                                transition: 'all 0.3s',
                                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            Get Started Free <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div id="features" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    paddingBottom: '8rem',
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
                <div style={{
                    textAlign: 'center',
                    paddingBottom: '8rem'
                }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '3rem' }}>
                        Trusted Document Expiry Management
                    </p>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '4rem',
                        opacity: 0.6,
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={20} color="#10b981" /> <span>Sync Support</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={20} color="#10b981" /> <span>Privacy First</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={20} color="#10b981" /> <span>Category Focused</span>
                        </div>
                    </div>
                </div>

                {/* FAQ / Help Section */}
                <div id="help" style={{
                    paddingBottom: '8rem',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3.5rem' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <FAQItem
                            question="How do the alerts work?"
                            answer="IDET automatically monitors your documents and sends professional Gmail notifications exactly 30 days and 7 days before they expire. You also get a synchronized sound alert when browsing."
                        />
                        <FAQItem
                            question="Can I sync with my calendar?"
                            answer="Yes! Every document has a one-click 'Add to Calendar' button that creates an event in your Google Calendar with the expiry date."
                        />
                        <FAQItem
                            question="Is my data secure?"
                            answer="We use Supabase for high-grade encryption and Google OAuth for secure login. Your document data is private and only accessible by you."
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                padding: '4rem 5%',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.9rem'
            }}>
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
    <div style={{
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        transition: 'all 0.3s'
    }}
        onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(-5px)';
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.transform = 'none';
        }}
    >
        <div style={{
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
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>{title}</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.6, fontSize: '0.95rem' }}>{description}</p>
    </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <div style={{
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px'
    }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#10b981' }}>{question}</h4>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>{answer}</p>
    </div>
);

export default Landing;
