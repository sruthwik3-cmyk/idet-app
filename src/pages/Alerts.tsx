import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Calendar, CheckCircle, Bell, History, TestTube } from 'lucide-react';

const Alerts: React.FC = () => {
    const { documents, refreshAlerts } = useApp();

    // Filter documents to show those that have at least one alert sent or a calendar event scheduled
    const alertDocs = documents.filter(doc =>
        doc.alerts.emailSent30 || doc.alerts.emailSent7 || doc.alerts.calendarEventId
    );

    return (
        <div className="animate-fade-in alerts-wrapper">
            <div className="page-header" style={{ marginBottom: '2rem', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Alerts & History</h1>
                    <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '0.95rem' }}>
                        Track your document notifications and alert history
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => window.open('/test-alerts.html', '_blank')}
                        className="btn-secondary"
                        style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                    >
                        <TestTube size={16} /> Test Alerts
                    </button>
                    <button
                        onClick={refreshAlerts}
                        className="btn-secondary"
                    >
                        <History size={16} /> Force Check
                    </button>
                    <div style={{ padding: '0.75rem 1.25rem', background: 'var(--primary-soft)', borderRadius: '12px', border: '1px solid var(--primary-glow)', color: '#c084fc', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bell size={18} /> {alertDocs.length} Active
                    </div>
                </div>
            </div>

            <div className="card glass-panel" style={{ padding: '2.5rem' }}>
                {alertDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            border: '1px solid rgba(255,255,255,0.08)',
                            animation: 'float 4s ease-in-out infinite'
                        }}>
                            <Mail size={40} color="var(--text-dim)" style={{ opacity: 0.3 }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Alerts Recorded</h3>
                        <p style={{ color: 'var(--text-dim)', maxWidth: '400px', margin: '0 auto' }}>
                            Your alert history is currently empty. Notifications are triggered automatically 30 and 7 days before a document expires.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {alertDocs.map((doc) => (
                            <div key={doc.id} className="alert-history-item" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '16px',
                                transition: 'all 0.3s var(--spring)'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{doc.name}</h3>
                                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                                            EXP: {new Date(doc.expiryDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: doc.alerts.calendarEventId ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 600 }}>
                                            <Calendar size={14} />
                                            <span>Calendar: {doc.alerts.calendarEventId ? 'SYNCED' : 'PENDING'}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: doc.alerts.emailSent30 ? 'var(--success)' : 'var(--text-dim)', fontWeight: 600 }}>
                                            <Mail size={14} />
                                            <span>30d Alert: {doc.alerts.emailSent30 ? 'SENT' : 'SCHEDULED'}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: doc.alerts.emailSent7 ? 'var(--success)' : 'var(--text-dim)', fontWeight: 600 }}>
                                            <Mail size={14} />
                                            <span>7d Alert: {doc.alerts.emailSent7 ? 'SENT' : 'SCHEDULED'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                                    {(doc.alerts.emailSent30 || doc.alerts.emailSent7) ? (
                                        <div className="badge badge-success" style={{ padding: '6px 16px', borderRadius: '12px' }}>
                                            <CheckCircle size={14} style={{ marginRight: '6px' }} /> COMPLETED
                                        </div>
                                    ) : (
                                        <div className="badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#c084fc', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '6px 16px', borderRadius: '12px' }}>
                                            <History size={14} style={{ marginRight: '6px' }} /> ACTIVE
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                .alerts-wrapper { padding-bottom: 3rem; }
                .alert-history-item:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(124, 58, 237, 0.2);
                    transform: translateX(6px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};

export default Alerts;
