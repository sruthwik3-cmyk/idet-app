import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Globe, Trash2, ArrowLeft, ChevronRight } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: Shield,
            title: "Data Security & Infrastructure",
            content: "We implement advanced server-side hardening including Helmet security headers (HSTS, CSP), AES-256 encryption at rest via Supabase, and per-user rate limiting to prevent spam and brute-force attacks. All data in transit is protected via HTTPS/TLS protocols."
        },
        {
            icon: Lock,
            title: "Authentication",
            content: "IDET uses Google OAuth 2.0 for all authentication. We never see or store your Google password. Your session is managed through secure JWT tokens with automatic expiry for enhanced security."
        },
        {
            icon: Database,
            title: "Information We Collect",
            content: "We collect minimal data required for our service: your name and email (for account identification and alerts), and any document metadata you choose to upload (titles, expiry dates, and categories)."
        },
        {
            icon: Eye,
            title: "Data Usage",
            content: "Your data is used exclusively to provide document management services, send automated expiry alerts via Gmail, and synchronize with your Google Calendar. We never sell or share your data with third parties."
        },
        {
            icon: Trash2,
            title: "Your Rights",
            content: "You maintain full control over your data. You can access, modify, or permanently delete your account and all associated document data at any time through your Profile settings. Deleted data is purged from our systems immediately."
        },
        {
            icon: Globe,
            title: "Cookies",
            content: "We use essential cookies strictly for session management and authentication. No tracking or marketing cookies are used on this platform."
        }
    ];

    return (
        <div className="animate-fade-in page-transition" style={{
            background: '#09090b',
            minHeight: '100vh',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem 1rem 4rem'
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header Navigation */}
                <button 
                    onClick={() => navigate('/')}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '0.75rem 1.25rem',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        marginBottom: '3rem',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                    className="btn-scale"
                    onMouseOver={(e: React.MouseEvent) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseOut={(e: React.MouseEvent) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                >
                    <ArrowLeft size={18} /> Back to Home
                </button>

                {/* Hero Section */}
                <header style={{ marginBottom: '4rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '50px',
                        color: '#10b981',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginBottom: '1.5rem'
                    }}>
                        <Shield size={14} /> Security First Architecture
                    </div>
                    <h1 style={{ 
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
                        fontWeight: 800, 
                        marginBottom: '1rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Privacy & <span style={{ color: '#10b981' }}>Security</span> Policy
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '600px' }}>
                        Last Updated: April 2, 2026. Your trust is our most valuable asset. 
                        Learn how we protect your documents and data.
                    </p>
                </header>

                {/* Policy Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {sections.map((section, idx) => (
                        <div 
                            key={idx}
                            style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '20px',
                                padding: '2rem',
                                transition: 'all 0.3s'
                            }}
                            className="hover-lift"
                        >
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    padding: '0.75rem',
                                    color: '#10b981'
                                }}>
                                    <section.icon size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{section.title}</h3>
                                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.7, fontSize: '1rem' }}>
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Footer */}
                <footer style={{ 
                    marginTop: '5rem', 
                    padding: '3rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Still have questions?</h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '2rem' }}>
                        Our security team is here to help you understand our data practices.
                    </p>
                    <a 
                        href="mailto:support@idet.app"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#10b981',
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: '1.1rem'
                        }}
                    >
                        Contact Support <ChevronRight size={20} />
                    </a>
                </footer>
            </div>
            
            <style>{`
                .hover-lift:hover {
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};

export default PrivacyPolicy;
