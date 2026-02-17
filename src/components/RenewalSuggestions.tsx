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

    const handleSpeak = (speech: string) => {
        if ('speechSynthesis' in window) {
            // Stop any ongoing speech
            window.speechSynthesis.cancel();

            setSpeaking(documentId);
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

    const handleOpenLink = (link: RenewalLink, documentId: string) => {
        openRenewalLink(link);
        // Optionally dismiss after opening
        // handleDismiss(documentId);
    };

    // Filter out dismissed items
    const visibleItems = renewalItems.filter(item => !dismissed.has(item.document.id));

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            maxWidth: '400px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {visibleItems.map((item) => (
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
                        animation: item.urgency === 'critical' ? 'pulse 2s infinite' : 'none'
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle 
                                size={24} 
                                color={item.urgency === 'critical' ? '#ef4444' : '#f59e0b'} 
                            />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                    Renewal Reminder
                                </h3>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Jarvis Smart Assistant
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDismiss(item.document.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                padding: '4px'
                            }}
                            title="Dismiss"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Document Info */}
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.document.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: item.urgency === 'critical' ? '#ef4444' : '#f59e0b' }}>
                            {item.urgency === 'critical' ? '🚨 ' : '⏰ '}
                            Expires in {item.daysLeft} day{item.daysLeft !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Jarvis Speech */}
                    <div style={{
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic'
                    }}>
                        "{item.speech}"
                    </div>

                    {/* Speak Button */}
                    <button
                        onClick={() => handleSpeak(item.speech)}
                        disabled={speaking === item.document.id}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: speaking === item.document.id 
                                ? 'rgba(129, 140, 248, 0.3)' 
                                : 'rgba(129, 140, 248, 0.2)',
                            color: '#818cf8',
                            border: '1px solid rgba(129, 140, 248, 0.3)',
                            borderRadius: '6px',
                            cursor: speaking === item.document.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            marginBottom: '0.75rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Volume2 size={16} />
                        {speaking === item.document.id ? 'Speaking...' : 'Hear Jarvis'}
                    </button>

                    {/* Renewal Links */}
                    {item.renewalLinks.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                RENEWAL OPTIONS:
                            </p>
                            {item.renewalLinks.slice(0, 2).map((link: RenewalLink, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => handleOpenLink(link, item.document.id)}
                                    style={{
                                        padding: '0.75rem',
                                        background: 'rgba(52, 211, 153, 0.2)',
                                        color: '#34d399',
                                        border: '1px solid rgba(52, 211, 153, 0.3)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(52, 211, 153, 0.3)';
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(52, 211, 153, 0.2)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <div>
                                        <div>{link.name}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem' }}>
                                            {link.description}
                                        </div>
                                    </div>
                                    <ExternalLink size={16} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}

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
