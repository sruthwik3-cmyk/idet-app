import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle, Loader2 } from 'lucide-react';

const SetupProfile: React.FC = () => {
    const { userProfile, updateUserProfile } = useApp();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: userProfile?.fullName === 'Demo User' ? '' : (userProfile?.fullName || ''),
        phone: userProfile?.phone || '',
        email: userProfile?.email || '',
        dob: userProfile?.dob || '',
        userGroup: userProfile?.userGroup || 'Self'
    });

    const [isMobile, setIsMobile] = useState(window.innerWidth < 850);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 850);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await updateUserProfile(formData);
            // Small delay to ensure state propagates
            setTimeout(() => {
                navigate('/dashboard');
            }, 100);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: '#0f172a',
            overflowX: 'hidden',
            padding: '1.5rem 0'
        }}>
            {/* Styles for responsive overrides */}
            <style>{`
                @media (max-width: 850px) {
                    .setup-profile-container {
                        grid-template-columns: 1fr !important;
                        height: auto !important;
                        max-height: none !important;
                        margin: 1rem !important;
                        overflow: visible !important;
                    }
                    .setup-profile-right {
                        display: none !important;
                    }
                    .setup-profile-left {
                        padding: 2rem !important;
                        border-right: none !important;
                        overflow: visible !important;
                    }
                    .setup-profile-left h1 {
                        font-size: 1.8rem !important;
                    }
                }
            `}</style>

            {/* Animated Background Gradients */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 10% 20%, rgb(79, 70, 229) 0%, rgb(15, 23, 42) 40%)',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 90% 80%, rgb(236, 72, 153) 0%, rgb(15, 23, 42) 40%)',
                zIndex: 0,
                opacity: 0.6
            }}></div>

            {/* Main Glass Container */}
            <div className="setup-profile-container" style={{
                width: '95%',
                maxWidth: '1000px',
                height: '85vh',
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                zIndex: 10
            }}>

                {/* Left Side - Form Area */}
                <div className="setup-profile-left" style={{
                    padding: '3rem',
                    overflowY: 'auto',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(to right, #fff, #a5b4fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Setup Your IDET Profile
                        </h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>Let's set up your digital workspace.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Profile Photo Icon */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                            }}>
                                {formData.fullName?.[0]?.toUpperCase() || <User size={30} />}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>Profile Identity</h3>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Update your personal details</p>
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
                            <input
                                className="input-field"
                                type="text"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                placeholder="Enter your full name"
                                style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)', width: '100%', color: 'white' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2rem' }}>
                            <div className="input-group">
                                <label style={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Phone</label>
                                <input
                                    className="input-field"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="Phone number"
                                    style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)', width: '100%', color: 'white' }}
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Date of Birth</label>
                                <input
                                    className="input-field"
                                    type="date"
                                    value={formData.dob}
                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                    required
                                    style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)', colorScheme: 'dark', width: '100%', color: 'white' }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Gmail (For Alerts)</label>
                            <input
                                className="input-field"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="your@email.com"
                                style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)', width: '100%', color: 'white' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Group</label>
                            <select
                                className="input-field"
                                value={formData.userGroup}
                                onChange={e => setFormData({ ...formData, userGroup: e.target.value as any })}
                                style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)', color: 'white', width: '100%' }}
                            >
                                <option value="Self" style={{ color: 'black' }}>Self</option>
                                <option value="Family" style={{ color: 'black' }}>Family</option>
                                <option value="Organization" style={{ color: 'black' }}>Organization</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary-full" 
                            disabled={isSubmitting}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                fontSize: '1rem',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin" size={20} /> Saving...</>
                            ) : (
                                'Complete Setup'
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Side - Visual Context */}
                <div className="setup-profile-right" style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '3rem',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>Why IDET?</h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
                            We connect your documents to your daily life using the tools you already rely on.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '2rem' }}>
                        <div style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center'
                        }}>
                            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: '#818cf8' }}>
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: 600, color: 'white' }}>Automated Sync</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Google Calendar & Gmail</p>
                            </div>
                        </div>

                        <div style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center'
                        }}>
                            <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.2)', borderRadius: '12px', color: '#f472b6' }}>
                                <User size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: 600, color: 'white' }}>Privacy First</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Your data, your control</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupProfile;
