import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, Bell, Send, Edit2, Save, X, Camera } from 'lucide-react';
import { sendExpiryAlert, testBackendConnectivity } from '../utils/emailService';
import { playAlertSound } from '../utils/soundUtils';
import { supabase } from '../utils/supabaseClient';

const Profile: React.FC = () => {
    const { userProfile, documents, updateUserProfile, showNotification } = useApp();
    const navigate = useNavigate();

    const [isSyncing, setIsSyncing] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [emailStatus, setEmailStatus] = useState<'checking' | 'configured' | 'error'>('checking');
    const [lastSynced, setLastSynced] = useState('Just now');
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        dob: '',
        userGroup: 'Self' as 'Self' | 'Family' | 'Organization'
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                fullName: userProfile.fullName || '',
                phone: userProfile.phone || '',
                dob: userProfile.dob || '',
                userGroup: userProfile.userGroup || 'Self'
            });
        }
    }, [userProfile, isEditing]);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/health');
                const data = await res.json();
                setEmailStatus(data.emailService === 'configured' ? 'configured' : 'error');
            } catch (e) {
                setEmailStatus('error');
            }
        };
        checkStatus();
    }, []);

    const handleSaveProfile = async () => {
        if (!userProfile) return;
        setIsSaving(true);
        try {
            await updateUserProfile({ ...userProfile, ...formData });
            setIsEditing(false);
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            showNotification('Failed to update profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestAlert = async (days: number) => {
        if (!userProfile?.email) return showNotification('Save email first!', 'error');
        setIsTesting(true);
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + days);
        const res = await sendExpiryAlert(userProfile.email, `Test ${days}-Day`, days, testDate.toISOString());
        if (res?.success) {
            playAlertSound();
            showNotification(`${days}-day test alert sent!`, 'success');
        } else {
            showNotification(`Error: ${res.reason || 'Failed'}`, 'error');
        }
        setIsTesting(false);
    };

    const handleVerifyConnection = async () => {
        if (!userProfile?.email) return showNotification('No email to verify.', 'error');
        setIsSyncing(true);
        try {
            const res = await testBackendConnectivity(userProfile.email);
            showNotification(res.success ? '✅ Connection Successful!' : `❌ Failed: ${res.error}`, res.success ? 'success' : 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1 className="page-title">Profile & Settings</h1></div>
            <div className="grid-cols-2" style={{ gridTemplateColumns: 'minmax(350px, 1fr) 1fr' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                                {userProfile?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h2 style={{ margin: 0 }}>{userProfile?.fullName || 'User'}</h2>
                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{userProfile?.email}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary" style={{ padding: '0.5rem' }}>
                            {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input disabled={!isEditing} className="input-field" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Phone</label>
                            <input disabled={!isEditing} className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        {isEditing && <button onClick={handleSaveProfile} disabled={isSaving} className="btn-primary" style={{ width: '100%' }}>{isSaving ? 'Saving...' : 'Save Profile'}</button>}
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn-logout" style={{ width: '100%' }}>Logout</button>
                    </div>
                </div>

                <div className="card">
                    <h3>Alert System Status</h3>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <strong>Gmail Service:</strong>
                            <span className={`badge badge-${emailStatus === 'configured' ? 'success' : 'danger'}`}>
                                {emailStatus === 'configured' ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button onClick={handleVerifyConnection} disabled={isSyncing} className="btn-secondary">{isSyncing ? 'Checking...' : 'Verify Gmail'}</button>
                            <button onClick={() => handleTestAlert(30)} disabled={isTesting} className="btn-secondary">Test 30d</button>
                            <button onClick={() => handleTestAlert(7)} disabled={isTesting} className="btn-secondary">Test 7d</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
