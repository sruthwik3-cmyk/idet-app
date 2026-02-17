import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';
import { pushNotificationService } from '../utils/pushNotifications';

const PushNotificationSettings: React.FC = () => {
    const [status, setStatus] = useState<{
        supported: boolean;
        permission: NotificationPermission;
        subscribed: boolean;
    }>({ supported: false, permission: 'default', subscribed: false });
    const [isEnabling, setIsEnabling] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const currentStatus = await pushNotificationService.getSubscriptionStatus();
        setStatus(currentStatus);
    };

    const handleEnable = async () => {
        setIsEnabling(true);
        try {
            const success = await pushNotificationService.initialize();
            if (success) {
                await checkStatus();
                alert('Push notifications enabled! You will receive alerts even when the browser is closed.');
            } else {
                alert('Failed to enable push notifications. Please check your browser settings.');
            }
        } catch (error) {
            console.error('Push notification error:', error);
            alert('Error enabling push notifications.');
        } finally {
            setIsEnabling(false);
        }
    };

    const handleDisable = async () => {
        const success = await pushNotificationService.unsubscribe();
        if (success) {
            await checkStatus();
            alert('Push notifications disabled.');
        }
    };

    if (!status.supported) {
        return (
            <div className="card" style={{ border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <BellOff size={24} color="var(--text-secondary)" />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Push Notifications</h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Not supported in this browser
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ 
            border: '1px solid rgba(255,255,255,0.05)', 
            marginBottom: '2rem',
            background: status.subscribed 
                ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                : 'var(--card-bg)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                    {status.subscribed ? (
                        <CheckCircle size={24} color="#34d399" />
                    ) : (
                        <Bell size={24} color="var(--primary)" />
                    )}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Web Push Notifications
                            {status.subscribed && (
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: 'rgba(52, 211, 153, 0.2)',
                                    color: '#34d399',
                                    border: '1px solid rgba(52, 211, 153, 0.3)'
                                }}>
                                    ACTIVE
                                </span>
                            )}
                        </h3>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {status.subscribed 
                                ? 'You will receive alerts even when the browser is closed'
                                : 'Get notified about expiring documents even when the app is closed'}
                        </p>

                        {/* Features List */}
                        <ul style={{ 
                            margin: '1rem 0 0', 
                            paddingLeft: '1.5rem', 
                            fontSize: '0.875rem', 
                            color: 'var(--text-secondary)',
                            lineHeight: '1.8'
                        }}>
                            <li>Receive alerts when documents are expiring</li>
                            <li>Works even when browser is closed</li>
                            <li>Click notification to open the app</li>
                            <li>Customizable alert timing</li>
                        </ul>

                        {/* Permission Status */}
                        {status.permission === 'denied' && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <AlertCircle size={16} color="#ef4444" />
                                <span style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                                    Notifications blocked. Please enable in browser settings.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enable/Disable Button */}
                <div>
                    {status.subscribed ? (
                        <button
                            onClick={handleDisable}
                            className="btn-secondary"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            <BellOff size={16} /> Disable
                        </button>
                    ) : (
                        <button
                            onClick={handleEnable}
                            disabled={isEnabling || status.permission === 'denied'}
                            className="btn-primary-full"
                            style={{ 
                                whiteSpace: 'nowrap',
                                marginBottom: 0,
                                opacity: status.permission === 'denied' ? 0.5 : 1,
                                cursor: status.permission === 'denied' ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Bell size={16} /> {isEnabling ? 'Enabling...' : 'Enable'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PushNotificationSettings;
