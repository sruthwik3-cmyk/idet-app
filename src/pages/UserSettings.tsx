import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit2, X, Send, RefreshCw, MessageSquare } from 'lucide-react';
import { testBackendConnectivity, sendExpiryAlert } from '../utils/emailService';
import { testSMSService, validatePhoneNumber } from '../utils/smsService';
import { playAlertSound } from '../utils/soundUtils';
import { supabase } from '../utils/supabaseClient';
import PushNotificationSettings from '../components/PushNotificationSettings';

const UserSettings: React.FC = () => {
    const { userProfile, updateUserProfile, showNotification } = useApp();
    const navigate = useNavigate();

    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [emailStatus, setEmailStatus] = useState<'checking' | 'configured' | 'error'>('checking');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', phone: '', dob: '', userGroup: 'Self' as any });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                fullName: userProfile.fullName || '',
                phone: userProfile.phone || '',
                dob: userProfile.dob || '',
                userGroup: userProfile.userGroup || 'Self'
            });
        }
    }, [userProfile]);

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch('/api/health');
                const data = await res.json();
                // If it contains "connected", it's configured
                const isOnline = data.gmailStatus && data.gmailStatus.includes('connected');
                setEmailStatus(isOnline ? 'configured' : 'error');

                if (!isOnline && data.gmailStatus) {
                    console.error("[Health Check] Gmail Error:", data.gmailStatus);
                }
            } catch { setEmailStatus('error'); }
        };
        check();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateUserProfile({ ...userProfile!, ...formData });
            setIsEditing(false);
            showNotification('Profile updated!', 'success');
        } catch { showNotification('Failed to update.', 'error'); }
        finally { setIsSaving(false); }
    };

    const handleTest = async (days: number) => {
        if (!userProfile?.email) return showNotification('Save email first', 'error');
        setIsTesting(true);
        try {
            // Play sound IMMEDIATELY for instant feedback
            playAlertSound();

            const res = await sendExpiryAlert(userProfile.email, `Test ${days}-Day`, days, new Date().toISOString());
            if (res.success) {
                showNotification(`${days}-day test sent!`, 'success');
            } else { showNotification('Failed to send test.', 'error'); }
        } finally { setIsTesting(false); }
    };

    const handleTestSMS = async () => {
        if (!userProfile?.phone) return showNotification('Please add phone number first', 'error');
        
        const phoneValidation = validatePhoneNumber(userProfile.phone);
        if (!phoneValidation.valid) {
            return showNotification(phoneValidation.error || 'Invalid phone number', 'error');
        }

        setIsTesting(true);
        try {
            showNotification('Sending test SMS...', 'info');
            const success = await testSMSService(phoneValidation.formatted);
            if (success) {
                showNotification('✅ Test SMS sent! Check your phone.', 'success');
            } else {
                showNotification('❌ Failed to send SMS. Check configuration.', 'error');
            }
        } catch (error) {
            showNotification('❌ SMS service error', 'error');
        } finally {
            setIsTesting(false);
        }
    };

    const handleVerify = async () => {
        if (!userProfile?.email) return;
        showNotification('Checking connection...', 'info');
        const res = await testBackendConnectivity(userProfile.email);
        showNotification(res.success ? '✅ Success' : '❌ Failed', res.success ? 'success' : 'error');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto', paddingBottom: '2rem' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 className="page-title">Profile Settings</h1>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 700, boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>
                            {userProfile?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{userProfile?.fullName || 'User'}</h2>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{userProfile?.email}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary">
                        {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
                    </button>
                </div>

                <div className="input-group">
                    <label>Full Name</label>
                    <input
                        disabled={!isEditing}
                        className="input-field"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    />
                </div>

                <div className="grid-cols-2">
                    <div className="input-group">
                        <label>Phone Number</label>
                        <input
                            disabled={!isEditing}
                            className="input-field"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            disabled={!isEditing}
                            className="input-field"
                            value={formData.dob}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label>User Group</label>
                    <select
                        disabled={!isEditing}
                        className="input-field"
                        value={formData.userGroup}
                        onChange={e => setFormData({ ...formData, userGroup: e.target.value as any })}
                    >
                        <option value="Self">Self</option>
                        <option value="Family">Family</option>
                        <option value="Organization">Organization</option>
                    </select>
                </div>

                {isEditing && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ flex: 1 }}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ flex: 1 }}>
                            Cancel
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <button onClick={handleLogout} className="btn-logout" style={{ width: '100%' }}><LogOut size={18} style={{ marginRight: '8px' }} />Logout</button>
                </div>
            </div>

            {/* Push Notification Settings */}
            <PushNotificationSettings />

            <div className="card">
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>System Verification</h3>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <strong style={{ fontSize: '0.95rem' }}>Email Status:</strong>
                            <span className={`badge badge-${emailStatus === 'configured' ? 'success' : 'danger'}`}>
                                {emailStatus === 'configured' ? '✓ ONLINE' : '✗ OFFLINE'}
                            </span>
                        </div>
                        <button onClick={handleVerify} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                            <RefreshCw size={14} /> Check Connection
                        </button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <button onClick={() => handleTest(30)} disabled={isTesting} className="btn-secondary" style={{ flex: 1, minWidth: '140px' }}>
                            <Send size={14} /> Test 30-Day Alert
                        </button>
                        <button onClick={() => handleTest(7)} disabled={isTesting} className="btn-secondary" style={{ flex: 1, minWidth: '140px' }}>
                            <Send size={14} /> Test 7-Day Alert
                        </button>
                    </div>

                    {/* SMS Test Section */}
                    {userProfile?.phone && (
                        <div style={{ 
                            padding: '1rem', 
                            background: 'rgba(52, 211, 153, 0.05)', 
                            borderRadius: '8px', 
                            border: '1px solid rgba(52, 211, 153, 0.2)',
                            marginTop: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MessageSquare size={16} color="#34d399" />
                                    <strong style={{ fontSize: '0.9rem', color: '#34d399' }}>SMS Alerts Enabled</strong>
                                </div>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {userProfile.phone}
                                </span>
                            </div>
                            <button 
                                onClick={handleTestSMS} 
                                disabled={isTesting} 
                                className="btn-secondary" 
                                style={{ width: '100%' }}
                            >
                                <MessageSquare size={14} /> Test SMS Alert
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
