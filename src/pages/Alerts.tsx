import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Calendar, CheckCircle } from 'lucide-react';

const Alerts: React.FC = () => {
    const { documents } = useApp();

    // Filter documents to show those that have at least one alert sent or a calendar event scheduled
    const alertDocs = documents.filter(doc =>
        doc.alerts.emailSent30 || doc.alerts.emailSent7 || doc.alerts.calendarEventId
    );

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Alerts & History</h1>
            </div>

            <div className="card">
                {alertDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Mail size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ color: 'var(--text-secondary)' }}>No alerts have been sent yet.</p>
                        <small style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>Alerts are automatically triggered 30 and 7 days before expiry.</small>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {alertDocs.map((doc) => (
                            <div key={doc.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: 'rgba(255,255,255,0.01)',
                                borderRadius: 'var(--radius)',
                                marginBottom: '0.5rem'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{doc.name}</h3>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                                            Exp: {doc.expiryDate}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: doc.alerts.calendarEventId ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                            <Calendar size={14} />
                                            <span>Calendar: {doc.alerts.calendarEventId ? 'Synced' : 'Not Sync'}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: doc.alerts.emailSent30 ? 'var(--success)' : 'var(--text-secondary)' }}>
                                            <Mail size={14} />
                                            <span>30d Alert: {doc.alerts.emailSent30 ? 'Sent' : 'Pending'}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: doc.alerts.emailSent7 ? 'var(--success)' : 'var(--text-secondary)' }}>
                                            <Mail size={14} />
                                            <span>7d Alert: {doc.alerts.emailSent7 ? 'Sent' : 'Pending'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    {(doc.alerts.emailSent30 || doc.alerts.emailSent7) ? (
                                        <span className="badge badge-success" style={{ padding: '4px 12px' }}>
                                            <CheckCircle size={12} style={{ marginRight: '4px' }} /> Active
                                        </span>
                                    ) : (
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '4px 12px' }}>
                                            Scheduled
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
