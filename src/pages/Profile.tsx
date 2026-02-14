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
    const [lastSynced, setLastSynced] = useState('Just now');

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        dob: '',
        userGroup: 'Self' as 'Self' | 'Family' | 'Organization'
    });

    // Initialize form data when profile loads or when entering edit mode
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

    const handleSaveProfile = async () => {
        if (!userProfile) return;
        setIsSaving(true);

        try {
            await updateUserProfile({
                ...userProfile,
                ...formData
            });
            setIsEditing(false);
            showNotification('Profile updated successfully!', 'success');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestAlert = async (days: number) => {
        if (!userProfile?.email) {
            showNotification('Please save your email in profile first.', 'error');
            return;
        }
        setIsTesting(true);

        // Simulate a date 'days' from now
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + days);

        const res = await sendExpiryAlert(userProfile.email, `Test ${days}-Day Document`, days, testDate.toISOString(), days <= 7 ? 'Critical' : 'Important');

        console.log(`Test ${days}-Day Alert Response:`, res);

        if (res?.success) {
            playAlertSound();
            showNotification(`${days}-day test alert sent to Gmail!`, 'success');
        } else {
            const errorMsg = res.reason === 'Credentials Missing'
                ? 'Gmail credentials not configured on server (GMAIL_APP_PASSWORD needed).'
                : (res.details || 'Failed to send test.');
            showNotification(`Error: ${errorMsg}`, 'error');
        }
        setIsTesting(false);
    };

    const handleVerifyConnection = async () => {
        if (!userProfile?.email) {
            showNotification('No email found to verify.', 'error');
            return;
        }
        setIsSyncing(true);
        try {
            const res = await testBackendConnectivity(userProfile.email);
            if (res.success) {
                showNotification('✅ Connection Successful! Verified with Gmail.', 'success');
            } else {
                showNotification(`❌ Connection Failed: ${res.error}`, 'error');
            }
        } catch (err: any) {
            showNotification(`❌ Connection Error: ${err.message}`, 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            const now = new Date();
            setLastSynced(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
        }, 2000);
    };

    const [emailStatus, setEmailStatus] = useState<'checking' | 'configured' | 'error'>('checking');

    useEffect(() => {
        const checkEmailStatus = async () => {
            try {
                const res = await fetch('/api/health');
                if (res.ok) {
                    const data = await res.json();
                    setEmailStatus(data.emailService.includes('configured') ? 'configured' : 'error');
                } else {
                    setEmailStatus('error');
                }
            } catch (e: any) {
                setEmailStatus('error');
            }
        };
        checkEmailStatus();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Profile & Settings</h1>
            </div>

            <div className="grid-cols-2" style={{ gridTemplateColumns: 'minmax(350px, 1fr) 1fr' }}>
                {/* Profile Card */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2rem',
                                fontWeight: 600,
                                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                                position: 'relative'
                            }}>
                                {userProfile?.fullName?.charAt(0) || 'U'}
                                {isEditing && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '50%',
                                        padding: '4px',
                                        cursor: 'pointer'
                                    }}>
                                        <Camera size={14} color="var(--text-secondary)" />
                                    </div>
                                )}
                            </div>
                            <div>
                                {!isEditing ? (
                                    <>
                                        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{userProfile?.fullName || 'User'}</h2>
                                        <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>{userProfile?.userGroup || 'Self'}</p>
                                    </>
                                ) : (
                                    <div className="badge badge-warning">Editing Profile</div>
                                )}
                            </div>
                        </div>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                            >
                                <Edit2 size={18} /> <span style={{ fontSize: '0.9rem' }}>Edit</span>
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '6px' }}
                                    title="Cancel"
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    style={{ background: 'var(--primary)', border: 'none', cursor: 'pointer', color: 'white', padding: '0.5rem', borderRadius: '6px', opacity: isSaving ? 0.7 : 1 }}
                                    title="Save"
                                >
                                    {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Name Field */}
                        <div className="input-group">
                            <label style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--primary)' }}
                                />
                            ) : (
                                <div style={{ padding: '0.75rem', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {userProfile?.fullName || 'Not set'}
                                </div>
                            )}
                        </div>

                        {/* Email Field (Always Read-only) */}
                        <div className="input-group">
                            <label style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-primary)' }}>{userProfile?.email}</span>
                                <span className="badge badge-success" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>Verified</span>
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div className="input-group">
                            <label style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    className="input-field"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                    style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--primary)' }}
                                />
                            ) : (
                                <div style={{ padding: '0.75rem', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {userProfile?.phone || 'Not set'}
                                </div>
                            )}
                        </div>

                        {/* Split Row for DOB and Group */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label style={{ color: 'var(--text-secondary)' }}>Date of Birth</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--primary)', colorScheme: 'dark' }}
                                    />
                                ) : (
                                    <div style={{ padding: '0.75rem', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {userProfile?.dob || 'Not set'}
                                    </div>
                                )}
                            </div>

                            <div className="input-group">
                                <label style={{ color: 'var(--text-secondary)' }}>Account Type</label>
                                {isEditing ? (
                                    <select
                                        className="input-field"
                                        value={formData.userGroup}
                                        onChange={(e) => setFormData({ ...formData, userGroup: e.target.value as any })}
                                        style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--primary)', color: 'white' }}
                                    >
                                        <option value="Self" style={{ color: 'black' }}>Individual</option>
                                        <option value="Family" style={{ color: 'black' }}>Family</option>
                                        <option value="Organization" style={{ color: 'black' }}>Organization</option>
                                    </select>
                                ) : (
                                    <div style={{ padding: '0.75rem', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {userProfile?.userGroup || 'Self'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            className="btn-logout"
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                color: 'var(--text-secondary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>

                {/* Status Column */}
                <div className="card">
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Bell size={20} color="var(--primary)" /> Sync Status
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }}>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>Google Calendar</strong>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Last synced: {lastSynced}</p>
                            </div>
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                                <RefreshCw
                                    size={18}
                                    color={isSyncing ? "var(--primary)" : "#34d399"}
                                    style={{
                                        animation: isSyncing ? 'spin 1s linear infinite' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                                <style>{`
                                    @keyframes spin {
                                        from { transform: rotate(0deg); }
                                        to { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>Gmail Alerts Service</strong>
                                    {emailStatus === 'configured' && <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '10px' }}>ONLINE</span>}
                                    {emailStatus === 'error' && <span className="badge badge-danger" style={{ padding: '2px 6px', fontSize: '10px' }}>OFFLINE</span>}
                                    {emailStatus === 'checking' && <span className="badge badge-neutral" style={{ padding: '2px 6px', fontSize: '10px' }}>CHECKING...</span>}
                                </div>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {emailStatus === 'error' ? 'Check Render Env (GMAIL_USER / GMAIL_APP_PASSWORD)' : 'Test automatic expiry emails'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleVerifyConnection}
                                    disabled={isSyncing}
                                    className="btn-secondary"
                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                                >
                                    {isSyncing ? 'Verifying...' : 'Verify Gmail Connection'}
                                </button>
                                <button
                                    onClick={() => handleTestAlert(30)}
                                    disabled={isTesting}
                                    style={{
                                        background: 'rgba(52, 211, 153, 0.1)',
                                        color: '#34d399',
                                        border: '1px solid rgba(52, 211, 153, 0.2)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.85rem',
                                        borderRadius: '6px',
                                        opacity: isTesting ? 0.6 : 1
                                    }}
                                >
                                    <Send size={14} /> Test 30-Day
                                </button>
                                <button
                                    onClick={() => handleTestAlert(7)}
                                    disabled={isTesting}
                                    style={{
                                        background: 'rgba(248, 113, 113, 0.1)',
                                        color: '#f87171',
                                        border: '1px solid rgba(248, 113, 113, 0.2)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.85rem',
                                        borderRadius: '6px',
                                        opacity: isTesting ? 0.6 : 1
                                    }}
                                >
                                    <Send size={14} /> Test 7-Day (Urgent)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>Data Management</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>Export Data</strong>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Download all documents as CSV</p>
                            </div>
                            <button
                                onClick={() => {
                                    const headers = ['Name', 'Category', 'Expiry Date', 'Priority', 'Notes'];
                                    const csvContent = [
                                        headers.join(','),
                                        ...documents.map(doc => [
                                            `"${doc.name}"`,
                                            `"${doc.category}"`,
                                            doc.expiryDate,
                                            doc.priority,
                                            `"${doc.notes || ''}"`
                                        ].join(','))
                                    ].join('\n');

                                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                    const link = document.createElement('a');
                                    if (link.download !== undefined) {
                                        const url = URL.createObjectURL(blob);
                                        link.setAttribute('href', url);
                                        link.setAttribute('download', 'my_documents_idet.csv');
                                        link.style.visibility = 'hidden';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }
                                }}
                                className="btn-secondary"
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    borderRadius: '6px'
                                }}
                            >
                                Download CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
