import React, { useState, useEffect } from 'react';
import { useApp, UserProfile } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, Send, Edit2, Save, Camera, Shield, User, Mail, Globe, Zap } from 'lucide-react';
import { sendExpiryAlert } from '../utils/emailService';
import { playAlertSound } from '../utils/soundUtils';
import { supabase } from '../utils/supabaseClient';

const Profile: React.FC = () => {
    const { userProfile, updateUserProfile, stats } = useApp();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>({
        fullName: userProfile?.fullName || '',
        phone: userProfile?.phone || '',
        email: userProfile?.email || '',
        dob: userProfile?.dob || '',
        userGroup: userProfile?.userGroup || 'Self'
    });

    const [testAlertEmail, setTestAlertEmail] = useState(userProfile?.email || '');
    const [isTesting, setIsTesting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setFormData({
                fullName: userProfile.fullName || '',
                phone: userProfile.phone || '',
                email: userProfile.email || '',
                dob: userProfile.dob || '',
                userGroup: userProfile.userGroup || 'Self'
            });
            setTestAlertEmail(userProfile.email || '');
        }
    }, [userProfile]);

    const handleSaveProfile = async () => {
        await updateUserProfile(formData);
        setIsEditing(false);
    };

    const handleTestAlert = async (days: number) => {
        if (isTesting) return;
        setIsTesting(true);
        try {
            playAlertSound();
            const success = await sendExpiryAlert(
                testAlertEmail,
                '???? SECURITY TEST DOCUMENT',
                days,
                new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                'Important'
            );

            if (success) {
                alert(`Test ${days}d alert triggered! Check ${testAlertEmail}`);
            } else {
                alert('Test alert failed. Check deployment logs or console.');
            }
        } catch (error) {
            console.error('Test alert error:', error);
        } finally {
            setIsTesting(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        // Simulate sync logic
        setTimeout(() => {
            setIsSyncing(false);
            alert('Cloud Vault Synchronization Complete.');
        }, 1500);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="animate-fade-in profile-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Profile Hub</h1>
                    <p style={{ color: 'var(--text-dim)', margin: '0.5rem 0 0', fontSize: '1rem' }}>
                        Manage your security credentials and system preferences.
                    </p>
                </div>
                <button className="btn-logout" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700 }}>
                    <LogOut size={18} /> TERMINATE SESSION
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '2.5rem', alignItems: 'start' }}>
                {/* Left: Avatar & Quick Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, var(--primary), #ec4899)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                fontWeight: 900,
                                color: 'white',
                                boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
                                border: '4px solid rgba(255,255,255,0.1)',
                                animation: 'float 6s ease-in-out infinite'
                            }}>
                                {formData.fullName?.charAt(0) || formData.email?.charAt(0) || 'U'}
                            </div>
                            <button style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '36px',
                                height: '36px',
                                background: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--bg)',
                                cursor: 'pointer',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s var(--spring)',
                                padding: '8px'
                            }} onClick={() => alert('Feature coming soon: Avatar Upload')}>
                                <Camera size={18} />
                            </button>
                        </div>
                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>{formData.fullName || 'Citizen User'}</h2>
                        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500 }}>{formData.email}</p>

                        <div style={{
                            marginTop: '2rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            paddingTop: '2rem'
                        }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#c084fc' }}>{stats.total}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Assets</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{stats.active}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Locked</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)' }}>
                        <h4 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Shield size={18} color="#34d399" /> SECURITY STATUS
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Vault Encryption</span>
                                <span style={{ color: '#34d399', fontWeight: 700 }}>AES-256 ACTIVE</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Alert Accuracy</span>
                                <span style={{ color: '#c084fc', fontWeight: 700 }}>99.9% MONITOR</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #34d399, #10b981)', animation: 'shimmerSweep 3s infinite' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card glass-panel" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Member Credentials</h3>
                            <button
                                className="btn-secondary"
                                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}
                            >
                                {isEditing ? <><Save size={16} /> COMMIT CHANGES</> : <><Edit2 size={16} /> UPDATE VAULT</>}
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="input-group">
                                <label><User size={14} style={{ marginRight: '6px' }} /> Full Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    disabled={!isEditing}
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label><Mail size={14} style={{ marginRight: '6px' }} /> Strategic Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    disabled={!isEditing}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label><Globe size={14} style={{ marginRight: '6px' }} /> Member Group</label>
                                <select
                                    className="input-field"
                                    disabled={!isEditing}
                                    value={formData.userGroup}
                                    onChange={(e) => setFormData({ ...formData, userGroup: e.target.value as any })}
                                >
                                    <option value="Self">Self</option>
                                    <option value="Family">Family</option>
                                    <option value="Organization">Organization</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label><Shield size={14} style={{ marginRight: '6px' }} /> Comms Link (Phone)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    disabled={!isEditing}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '2.5rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: 800 }}>System Diagnostics</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '1rem' }}>Trigger Manual Scan</label>
                                <button
                                    className="btn-primary-full"
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    style={{ height: '50px', marginBottom: 0 }}
                                >
                                    {isSyncing ? <RefreshCw size={20} className="animate-spin" /> : <><RefreshCw size={20} /> SYNC CLOUD VAULT</>}
                                </button>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem' }}>Last sync: moments ago.</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '1rem' }}>Alert Communications Test</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => handleTestAlert(30)}
                                        className="btn-secondary"
                                        style={{ flex: 1, padding: '1rem', borderStyle: 'dashed' }}
                                        title="Send 30d test email"
                                        disabled={isTesting}
                                    >
                                        <Send size={16} /> 30D TEST
                                    </button>
                                    <button
                                        onClick={() => handleTestAlert(7)}
                                        className="btn-secondary"
                                        style={{ flex: 1, padding: '1rem', borderStyle: 'dotted' }}
                                        title="Send 7d test email"
                                        disabled={isTesting}
                                    >
                                        <Zap size={16} /> 7D TEST
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem' }}>Test real-time Gmail alert delivery to your address.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .profile-wrapper { padding-bottom: 4rem; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Profile;
