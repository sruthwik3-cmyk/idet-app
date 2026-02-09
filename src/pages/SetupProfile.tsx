import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle } from 'lucide-react';

const SetupProfile: React.FC = () => {
    const { userProfile, updateUserProfile } = useApp();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: userProfile?.fullName === 'Demo User' ? '' : (userProfile?.fullName || ''),
        phone: userProfile?.phone || '',
        email: userProfile?.email || '',
        dob: userProfile?.dob || '',
        userGroup: userProfile?.userGroup || 'Self'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserProfile(formData);
        navigate('/dashboard');
    };

    return (
        <div className="animate-fade-in" style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: '#0f172a', /* Fallback */
            overflow: 'hidden'
        }}>
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
            <div style={{
                width: '100%',
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
                <div style={{
                    padding: '3rem',
                    overflowY: 'auto',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)'
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
                        {/* Photo Upload Simulation */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
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
                                {userProfile?.fullName?.[0] || <User />}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'white' }}>Profile Photo</h3>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Upload a new avatar</p>
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Full Name</label>
                            <input
                                className="input-field"
                                type="text"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="input-group">
                                <label style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Phone</label>
                                <input
                                    className="input-field"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                                />
                            </div>
                            <div className="input-group">
                                <label style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Date of Birth</label>
                                <input
                                    className="input-field"
                                    type="date"
                                    value={formData.dob}
                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                    required
                                    style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)', colorScheme: 'dark' }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Gmail (For Alerts)</label>
                            <input
                                className="input-field"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Group</label>
                            <select
                                className="input-field"
                                value={formData.userGroup}
                                onChange={e => setFormData({ ...formData, userGroup: e.target.value as any })}
                                style={{ background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                            >
                                <option value="Self" style={{ color: 'black' }}>Self</option>
                                <option value="Family" style={{ color: 'black' }}>Family</option>
                                <option value="Organization" style={{ color: 'black' }}>Organization</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-primary-full" style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            fontSize: '1rem',
                            letterSpacing: '0.5px'
                        }}>
                            Complete Setup
                        </button>
                    </form>
                </div>

                {/* Right Side - Visual Context */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '3rem',
                    background: 'rgba(0,0,0,0.2)'
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
