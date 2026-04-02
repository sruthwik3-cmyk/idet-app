import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ExternalLink, X, Volume2 } from 'lucide-react';
import { getDocumentsNeedingRenewal, openRenewalLink, type RenewalLink } from '../utils/renewalAssistant';

const RenewalSuggestions: React.FC = () => {
    const { documents } = useApp();
    const [renewalItems, setRenewalItems] = useState<any[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [speaking, setSpeaking] = useState<string | null>(null);

    useEffect(() => {
        const items = getDocumentsNeedingRenewal(documents);
        setRenewalItems(items);

        // Load dismissed items from localStorage
        const dismissedStr = localStorage.getItem('dismissed-renewals');
        if (dismissedStr) {
            setDismissed(new Set(JSON.parse(dismissedStr)));
        }
    }, [documents]);

    const handleDismiss = (documentId: string) => {
        const newDismissed = new Set(dismissed);
        newDismissed.add(documentId);
        setDismissed(newDismissed);
        localStorage.setItem('dismissed-renewals', JSON.stringify(Array.from(newDismissed)));
    };

    const handleSpeak = (speech: string, docId: string) => {
        if ('speechSynthesis' in window) {
            // Stop any ongoing speech
            window.speechSynthesis.cancel();

            setSpeaking(docId);
            const utterance = new SpeechSynthesisUtterance(speech);
            utterance.onend = () => setSpeaking(null);
            
            // Use a nice voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.name.includes('Google') || 
                voice.name.includes('Female') ||
                voice.name.includes('Samantha')
            );
            if (preferredVoice) utterance.voice = preferredVoice;

            window.speechSynthesis.speak(utterance);
        }
    };

    const handleOpenLink = (link: RenewalLink) => {
        openRenewalLink(link);
    };

    // Filter out dismissed items
    const visibleItems = renewalItems.filter(item => !dismissed.has(item.document.id));

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1rem',
            width: 'min(340px, calc(100vw - 2rem))',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxHeight: '50vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none'
        }}>
            {visibleItems.slice(0, 2).map((item) => (
                <div
                    key={item.document.id}
                    className="card animate-fade-in"
                    style={{
                        background: item.urgency === 'critical'
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                        border: item.urgency === 'critical'
                            ? '1px solid rgba(239, 68, 68, 0.5)'
                            : '1px solid rgba(251, 191, 36, 0.5)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        padding: '0.75rem',
                        borderRadius: '12px'
                    }}
                >
                    {/* Header — compact */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <AlertTriangle size={16} color={item.urgency === 'critical' ? '#ef4444' : '#f59e0b'} />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Renewal Reminder</p>
                                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Jarvis Smart Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDismiss(item.document.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', lineHeight: 1 }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Doc name + expiry — one line each */}
                    <p style={{ margin: '0 0 0.2rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.document.name}
                    </p>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', color: item.urgency === 'critical' ? '#ef4444' : '#f59e0b' }}>
                        {item.urgency === 'critical' ? '🚨 ' : '⏰ '}
                        Expires in {item.daysLeft} day{item.daysLeft !== 1 ? 's' : ''}
                    </p>

                    {/* Action buttons row */}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                            onClick={() => handleSpeak(item.speech, item.document.id)}
                            disabled={speaking === item.document.id}
                            style={{
                                flex: 1,
                                padding: '0.45rem 0.5rem',
                                background: 'rgba(129, 140, 248, 0.2)',
                                color: '#818cf8',
                                border: '1px solid rgba(129, 140, 248, 0.3)',
                                borderRadius: '6px',
                                cursor: speaking === item.document.id ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.3rem',
                                fontSize: '0.75rem',
                                fontWeight: 500
                            }}
                        >
                            <Volume2 size={13} />
                            {speaking === item.document.id ? 'Speaking...' : 'Hear Jarvis'}
                        </button>

                        {item.renewalLinks.length > 0 && (
                            <button
                                onClick={() => handleOpenLink(item.renewalLinks[0])}
                                style={{
                                    flex: 1,
                                    padding: '0.45rem 0.5rem',
                                    background: 'rgba(52, 211, 153, 0.2)',
                                    color: '#34d399',
                                    border: '1px solid rgba(52, 211, 153, 0.3)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}
                            >
                                <ExternalLink size={13} />
                                Renew
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {/* Show count if more than 2 */}
            {visibleItems.length > 2 && (
                <div style={{
                    textAlign: 'center',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    padding: '0.25rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px'
                }}>
                    +{visibleItems.length - 2} more reminder{visibleItems.length - 2 > 1 ? 's' : ''}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default RenewalSuggestions;
