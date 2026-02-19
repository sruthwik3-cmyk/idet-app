import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Bell, Calendar, Sparkles, Shield, Zap, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: Bell,
            title: '3 Alert Methods',
            description: 'Gmail, Calendar, and Sound alerts ensure you never miss a renewal deadline'
        },
        {
            icon: Sparkles,
            title: 'AI Assistant',
            description: 'Jarvis AI provides smart renewal suggestions and voice commands'
        },
        {
            icon: Shield,
            title: 'Secure & Private',
            description: 'Google OAuth authentication with encrypted data storage'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Page loads in under 2 seconds with 99.9% uptime'
        },
        {
            icon: FileText,
            title: 'File Upload',
            description: 'Store document copies securely with easy download access'
        },
        {
            icon: Calendar,
            title: 'Calendar View',
            description: 'Visual calendar with color-coded expiry dates'
        }
    ];

    const stats = [
        { value: '100%', label: 'Alert Accuracy' },
        { value: '99.9%', label: 'Uptime' },
        { value: '<2s', label: 'Page Load' },
        { value: 'Free', label: 'Forever' }
    ];

    const trustedBy = [
        'Students', 'Professionals', 'Families', 'Organizations',
        'Freelancers', 'Small Business', 'Enterprises', 'Individuals'
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Animated Background */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at ${50 + scrollY * 0.1}% ${50 + scrollY * 0.05}%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)`,
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Navigation */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '1.5rem 5%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: scrollY > 50 ? 'rgba(26, 26, 46, 0.95)' : 'transparent',
                backdropFilter: scrollY > 50 ? 'blur(10px)' : 'none',
                transition: 'all 0.3s',
                zIndex: 1000,
                borderBottom: scrollY > 50 ? '1px solid rgba(124, 58, 237, 0.2)' : 'none'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    <FileText size={32} style={{ color: '#7c3aed' }} />
                    IDET
                </div>

                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center'
                }}>
                    <a href="#features" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.3s' }}>Features</a>
                    <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.3s' }}>How It Works</a>
                    <a href="#pricing" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.3s' }}>Pricing</a>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            borderRadius: '50px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 5%',
                textAlign: 'center',
                zIndex: 1
            }}>
                <div style={{
                    background: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '50px',
                    padding: '0.5rem 1.5rem',
                    marginBottom: '2rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    animation: 'fadeInUp 0.6s ease'
                }}>
                    ✨ Never Miss a Document Renewal Again
                </div>

                <h1 style={{
                    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                    fontWeight: '800',
                    marginBottom: '1.5rem',
                    lineHeight: '1.2',
                    animation: 'fadeInUp 0.8s ease',
                    background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Track Documents,<br />
                    Never Miss Deadlines
                </h1>

                <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    color: 'rgba(255,255,255,0.7)',
                    maxWidth: '700px',
                    marginBottom: '3rem',
                    lineHeight: '1.6',
                    animation: 'fadeInUp 1s ease'
                }}>
                    Say goodbye to expired documents. IDET automatically tracks your important documents
                    and sends smart alerts before they expire. Powered by AI.
                </p>

                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    animation: 'fadeInUp 1.2s ease'
                }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem 3rem',
                            borderRadius: '50px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 8px 25px rgba(124, 58, 237, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 12px 35px rgba(124, 58, 237, 0.7)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.5)';
                        }}
                    >
                        Start Free <ArrowRight size={20} />
                    </button>

                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: '2px solid rgba(255,255,255,0.2)',
                            padding: '1rem 3rem',
                            borderRadius: '50px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                    >
                        Learn More
                    </button>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '2rem',
                    marginTop: '5rem',
                    maxWidth: '900px',
                    width: '100%'
                }}>
                    {stats.map((stat, index) => (
                        <div key={index} style={{
                            textAlign: 'center',
                            animation: `fadeInUp ${1.4 + index * 0.1}s ease`
                        }}>
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '0.5rem'
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '0.9rem'
                            }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trusted By */}
                <div style={{
                    marginTop: '5rem',
                    textAlign: 'center'
                }}>
                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.9rem',
                        marginBottom: '2rem'
                    }}>
                        Trusted by thousands of users worldwide
                    </p>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        justifyContent: 'center',
                        maxWidth: '800px'
                    }}>
                        {trustedBy.map((name, index) => (
                            <div key={index} style={{
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{
                position: 'relative',
                padding: '8rem 5%',
                zIndex: 1
            }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Powerful Features
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: 'rgba(255,255,255,0.6)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Everything you need to manage your documents efficiently
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {features.map((feature, index) => (
                        <div key={index} style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            padding: '2.5rem',
                            transition: 'all 0.3s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(124, 58, 237, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <feature.icon size={30} />
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                marginBottom: '1rem',
                                color: 'white'
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{
                                color: 'rgba(255,255,255,0.6)',
                                lineHeight: '1.6'
                            }}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                position: 'relative',
                padding: '8rem 5%',
                textAlign: 'center',
                zIndex: 1
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '30px',
                    padding: '5rem 3rem',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        color: 'white'
                    }}>
                        Ready to Get Started?
                    </h2>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '3rem',
                        maxWidth: '600px',
                        margin: '0 auto 3rem'
                    }}>
                        Join thousands of users who never miss a document renewal deadline
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'white',
                            color: '#7c3aed',
                            border: 'none',
                            padding: '1.2rem 3.5rem',
                            borderRadius: '50px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 12px 35px rgba(255,255,255,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,255,255,0.3)';
                        }}
                    >
                        Start Free Today <ArrowRight size={22} />
                    </button>
                    <p style={{
                        marginTop: '1.5rem',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.9rem'
                    }}>
                        No credit card required • Free forever
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                position: 'relative',
                padding: '3rem 5%',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
                zIndex: 1
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    <FileText size={28} style={{ color: '#7c3aed' }} />
                    IDET
                </div>
                <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.9rem'
                }}>
                    © 2024 IDET. All rights reserved. • Made with ❤️ for better document management
                </p>
            </footer>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                a:hover {
                    color: white !important;
                }

                @media (max-width: 768px) {
                    nav {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
