import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit2, X, Send, RefreshCw } from 'lucide-react';
import { testBackendConnectivity, sendExpiryAlert } from '../utils/emailService';
import { playAlertSound } from '../utils/soundUtils';
import { supabase } from '../utils/supabaseClient';

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
            const res = await sendExpiryAlert(userProfile.email, `Test ${days}-Day`, days, new Date().toISOString());
            if (res.success) {
                playAlertSound();
                showNotification(`${days}-day test sent!`, 'success');
            } else { showNotification('Failed to send test.', 'error'); }
        } finally { setIsTesting(false); }
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
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header"><h1 className="page-title">Profile Settings</h1></div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                            {userProfile?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 style={{ margin: 0 }}>{userProfile?.fullName || 'User'}</h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{userProfile?.email}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary" style={{ padding: '0.5rem' }}>
                        {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label>Name</label>
                        <input disabled={!isEditing} className="input-field" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Phone</label>
                        <input disabled={!isEditing} className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    {isEditing && <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ width: '100%' }}>{isSaving ? 'Saving...' : 'Save Profile'}</button>}
                </div>

                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <button onClick={handleLogout} className="btn-logout" style={{ width: '100%' }}><LogOut size={18} style={{ marginRight: '8px' }} />Logout</button>
                </div>
            </div>

            <div className="card">
                <h3>System Verification</h3>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                        <strong>Email Status:</strong>
                        <span className={`badge badge-${emailStatus === 'configured' ? 'success' : 'danger'}`}>
                            {emailStatus === 'configured' ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={handleVerify} className="btn-secondary"><RefreshCw size={14} style={{ marginRight: '6px' }} /> Check Connection</button>
                        <button onClick={() => handleTest(30)} disabled={isTesting} className="btn-secondary">
                            <Send size={14} style={{ marginRight: '6px' }} /> Test 30d
                        </button>
                        <button onClick={() => handleTest(7)} disabled={isTesting} className="btn-secondary">
                            <Send size={14} style={{ marginRight: '6px' }} /> Test 7d
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
