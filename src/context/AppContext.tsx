import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { initEmailService, sendExpiryAlert } from '../utils/emailService';
import { playAlertSound } from '../utils/soundUtils';

export interface Document {
    id: string;
    name: string;
    category: string;
    expiryDate: string; // YYYY-MM-DD
    priority: 'Critical' | 'Important' | 'Optional';
    notes?: string;
    userGroup: 'Self' | 'Family' | 'Organization';
    alerts: {
        calendarEventId?: string;
        emailSent30: boolean;
        emailSent7: boolean;
        scheduledAt: string;
    };
}

export interface UserProfile {
    fullName: string;
    phone: string;
    email: string;
    dob: string;
    userGroup: 'Self' | 'Family' | 'Organization';
}

interface AppContextType {
    documents: Document[];
    userProfile: UserProfile | null;
    addDocument: (doc: Omit<Document, 'id' | 'alerts'>) => Promise<Document | null>;
    updateDocument: (id: string, updates: Partial<Document>) => Promise<boolean>;
    updateUserProfile: (profile: UserProfile) => void;
    deleteDocument: (id: string) => void;
    stats: {
        total: number;
        active: number;
        expiringSoon: number;
        expired: number;
    };
    loading: boolean;
    notification: { message: string, type: 'success' | 'info' | 'error' } | null;
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    // Initial Data Fetch & Auth Listener & Realtime Subscription
    useEffect(() => {
        let realtimeSubscription: RealtimeChannel | null = null;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchUserData(session.user.id, session.user.email);
                setupRealtimeSubscription(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchUserData(session.user.id, session.user.email);
                setupRealtimeSubscription(session.user.id);
            } else {
                if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);
                setDocuments([]);
                setUserProfile(null);
                setLoading(false);
            }
        });

        const timeInterval = setInterval(() => {
            checkAndSendAlerts();
        }, 60000);

        const setupRealtimeSubscription = (userId: string) => {
            if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);

            realtimeSubscription = supabase
                .channel('public:documents')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'documents', filter: `user_id=eq.${userId}` },
                    (payload) => {
                        handleRealtimeUpdate(payload);
                    }
                )
                .subscribe();
        };

        const handleRealtimeUpdate = (payload: any) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            setDocuments(prevDocs => {
                switch (eventType) {
                    case 'INSERT':
                        if (prevDocs.some(d => d.id === newRecord.id)) return prevDocs;
                        return [...prevDocs, {
                            id: newRecord.id,
                            name: newRecord.name,
                            category: newRecord.category,
                            expiryDate: newRecord.expiry_date,
                            priority: newRecord.priority,
                            notes: newRecord.notes,
                            userGroup: 'Self',
                            alerts: newRecord.alerts_json || { emailSent30: false, emailSent7: false, scheduledAt: '', calendarEventId: '' }
                        }];
                    case 'UPDATE':
                        return prevDocs.map(doc => doc.id === newRecord.id ? {
                            ...doc,
                            name: newRecord.name,
                            category: newRecord.category,
                            expiryDate: newRecord.expiry_date,
                            priority: newRecord.priority,
                            notes: newRecord.notes,
                            alerts: newRecord.alerts_json
                        } : doc);
                    case 'DELETE':
                        return prevDocs.filter(doc => doc.id !== oldRecord.id);
                    default:
                        return prevDocs;
                }
            });
        };

        return () => {
            subscription.unsubscribe();
            if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);
            clearInterval(timeInterval);
        };
    }, []);

    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!loading && documents.length > 0 && userProfile) {
            checkAndSendAlerts();
        }
    }, [documents, loading, userProfile]);

    const checkAndSendAlerts = async () => {
        console.log(`[AlertCheck] Starting check. Email: ${userProfile?.email}, Docs: ${documents.length}`);
        if (!userProfile?.email || documents.length === 0) {
            console.log('[AlertCheck] Skipping: No email or no documents');
            return;
        }

        const now = new Date();
        const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        console.log(`[AlertCheck] Today UTC: ${new Date(todayUTC).toISOString()}`);

        for (const doc of documents) {
            const expiry = new Date(doc.expiryDate);
            const expiryUTC = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
            const diffDays = Math.floor((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));

            console.log(`[AlertCheck] "${doc.name}" → ${diffDays} days left | emailSent30: ${doc.alerts?.emailSent30} | emailSent7: ${doc.alerts?.emailSent7}`);

            // 30-Day Alert block
            if (diffDays <= 30 && diffDays > 7 && !doc.alerts?.emailSent30) {
                console.log(`[Alert] 🔔 TRIGGERING 30-day alerts for "${doc.name}" (${diffDays} days left)`);

                // FORCE SILENCE FOR > 30
                if (diffDays > 30) {
                    console.log(`[Alert] SILENCING sound for ${doc.name} as it is > 30 days.`);
                } else {
                    playAlertSound();
                }
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`📅 Document Duty: ${doc.name}`, {
                        body: `Expires in ${diffDays} days.`,
                        icon: '/pwa-192x192.png'
                    });
                }

                // Send Gmail alert in parallel
                try {
                    const res = await sendExpiryAlert(userProfile.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    console.log(`[Alert] Email result for "${doc.name}":`, res);
                    if (res?.success) {
                        const nextAlerts = { ...doc.alerts, emailSent30: true };
                        await supabase.from('documents').update({ alerts_json: nextAlerts }).eq('id', doc.id);
                        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, alerts: nextAlerts } : d));
                        showNotification(`✅ 30-day email reminder sent for ${doc.name}`, 'success');
                    } else {
                        console.error(`[Alert] Email FAILED for "${doc.name}":`, res);
                        showNotification(`❌ Failed to send 30-day alert for ${doc.name}`, 'error');
                    }
                } catch (err) {
                    console.error(`[Alert] Email ERROR for "${doc.name}":`, err);
                    showNotification(`❌ Error sending alert for ${doc.name}`, 'error');
                }
            }

            // 7-Day Alert block
            if (diffDays <= 7 && diffDays >= 0 && !doc.alerts?.emailSent7) {
                console.log(`[Alert] 🚨 TRIGGERING 7-day alerts for "${doc.name}" (${diffDays} days left)`);

                // TRIGGER SOUND + NOTIFICATION IMMEDIATELY
                playAlertSound();
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`🚨 URGENT: ${doc.name}`, {
                        body: `Only ${diffDays} days left!`,
                        icon: '/pwa-192x192.png',
                        requireInteraction: true
                    });
                }

                // Send Gmail alert in parallel
                try {
                    const res = await sendExpiryAlert(userProfile.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    console.log(`[Alert] Email result for "${doc.name}":`, res);
                    if (res?.success) {
                        const nextAlerts = { ...doc.alerts, emailSent7: true };
                        await supabase.from('documents').update({ alerts_json: nextAlerts }).eq('id', doc.id);
                        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, alerts: nextAlerts } : d));
                        showNotification(`✅ Urgent 7-day email sent for ${doc.name}`, 'success');
                    } else {
                        console.error(`[Alert] Email FAILED for "${doc.name}":`, res);
                        showNotification(`❌ Failed to send 7-day alert for ${doc.name}`, 'error');
                    }
                } catch (err) {
                    console.error(`[Alert] Email ERROR for "${doc.name}":`, err);
                    showNotification(`❌ Error sending alert for ${doc.name}`, 'error');
                }
            }
        }
        console.log('[AlertCheck] Check complete');
    };

    const fetchUserData = async (userId: string, authEmail?: string | null) => {
        setLoading(true);
        try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (profile) {
                setUserProfile({
                    fullName: profile.full_name as string,
                    email: (profile.email as string) || authEmail || '',
                    phone: profile.phone as string,
                    dob: profile.dob as string,
                    userGroup: profile.user_group as 'Self' | 'Family' | 'Organization'
                });
            }

            const { data: docs } = await supabase.from('documents').select('*').order('expiry_date', { ascending: true });
            if (docs) {
                setDocuments(docs.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    category: d.category,
                    expiryDate: d.expiry_date,
                    priority: d.priority,
                    notes: d.notes,
                    userGroup: 'Self',
                    alerts: d.alerts_json || { emailSent30: false, emailSent7: false, scheduledAt: '', calendarEventId: '' }
                })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { initEmailService(); }, []);

    const addDocument = async (docData: Omit<Document, 'id' | 'alerts'>): Promise<Document | null> => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return null;
        const newAlerts = { emailSent30: false, emailSent7: false, scheduledAt: new Date().toISOString(), calendarEventId: `cal-${uuidv4().slice(0, 8)}` };
        const { data, error } = await supabase.from('documents').insert({
            user_id: user.id,
            name: docData.name,
            category: docData.category,
            expiry_date: docData.expiryDate,
            priority: docData.priority,
            notes: docData.notes,
            alerts_json: newAlerts
        }).select().single();

        if (error) {
            console.error('[AddDoc] Supabase Insert Error:', error);
            showNotification(`❌ Storage Error: ${error.message}`, 'error');
            return null;
        }

        if (data) {
            const savedDoc: Document = { ...docData, id: data.id, alerts: newAlerts };
            setDocuments(prev => [...prev, savedDoc]);

            // Calculate days to expiry for the NEW document
            const now = new Date();
            const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
            const expiry = new Date(docData.expiryDate);
            const expiryUTC = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
            const diffDays = Math.floor((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));

            console.log(`[AddDoc] "${docData.name}" saved. ${diffDays} days until expiry.`);

            // 30-Day Rule: ≤30 and >7 days → Sound + Gmail
            if (diffDays <= 30 && diffDays > 7) {
                console.log(`[AddDoc] 🔔 Within 30-day window. Scheduling Gmail alert.`);
                // REMOVED playAlertSound() to prevent double triggers with checkAndSendAlerts

                if (userProfile?.email) {
                    try {
                        const res = await sendExpiryAlert(userProfile.email, docData.name, diffDays, docData.expiryDate, docData.priority);
                        if (res?.success) {
                            const nextAlerts = { ...newAlerts, emailSent30: true };
                            await supabase.from('documents').update({ alerts_json: nextAlerts }).eq('id', data.id);
                            setDocuments(prev => prev.map(d => d.id === data.id ? { ...d, alerts: nextAlerts } : d));
                            showNotification(`✅ 30-day alert sent for "${docData.name}"`, 'success');
                        } else {
                            showNotification(`❌ Failed to send alert for "${docData.name}"`, 'error');
                        }
                    } catch (err) {
                        console.error('[AddDoc] Email error:', err);
                        showNotification(`❌ Email error for "${docData.name}"`, 'error');
                    }
                }
            }

            // 7-Day Rule: ≤7 and ≥0 days → Sound + Gmail (urgent)
            if (diffDays <= 7 && diffDays >= 0) {
                console.log(`[AddDoc] 🚨 Within 7-day window! Scheduling urgent Gmail alert.`);
                // REMOVED playAlertSound() to prevent double triggers with checkAndSendAlerts

                if (userProfile?.email) {
                    try {
                        const res = await sendExpiryAlert(userProfile.email, docData.name, diffDays, docData.expiryDate, docData.priority);
                        if (res?.success) {
                            const nextAlerts = { ...newAlerts, emailSent7: true };
                            await supabase.from('documents').update({ alerts_json: nextAlerts }).eq('id', data.id);
                            setDocuments(prev => prev.map(d => d.id === data.id ? { ...d, alerts: nextAlerts } : d));
                            showNotification(`✅ Urgent 7-day alert sent for "${docData.name}"`, 'success');
                        } else {
                            showNotification(`❌ Failed to send urgent alert for "${docData.name}"`, 'error');
                        }
                    } catch (err) {
                        console.error('[AddDoc] Email error:', err);
                        showNotification(`❌ Email error for "${docData.name}"`, 'error');
                    }
                }
            }

            // >30 days: No sound, no Gmail. Calendar opens in AddDocument.tsx
            if (diffDays > 30) {
                console.log(`[AddDoc] >30 days out. No sound/Gmail. Calendar will auto-open.`);
                showNotification(`✅ "${docData.name}" saved! Calendar event opening.`, 'success');
            }

            return savedDoc;
        }
        return null;
    };

    const deleteDocument = async (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
        await supabase.from('documents').delete().eq('id', id);
    };

    const updateDocument = async (id: string, updates: Partial<Document>): Promise<boolean> => {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
        if (updates.priority) dbUpdates.priority = updates.priority;
        if (updates.notes) dbUpdates.notes = updates.notes;
        if (updates.alerts) dbUpdates.alerts_json = updates.alerts;

        const { error } = await supabase.from('documents').update(dbUpdates).eq('id', id);

        if (error) {
            console.error('[UpdateDoc] Supabase Update Error:', error);
            showNotification(`❌ Update Failed: ${error.message}`, 'error');
            return false;
        }

        setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
        checkAndSendAlerts();
        return true;
    };

    const updateUserProfile = async (profile: UserProfile) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;
        setUserProfile(profile);
        await supabase.from('profiles').upsert({
            id: user.id,
            full_name: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            user_group: profile.userGroup,
            dob: profile.dob,
            updated_at: new Date()
        });
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
        total: documents.length,
        active: documents.filter(d => new Date(d.expiryDate) >= today).length,
        expiringSoon: documents.filter(d => {
            const diffDays = Math.ceil((new Date(d.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        }).length,
        expired: documents.filter(d => new Date(d.expiryDate) < today).length
    };

    return (
        <AppContext.Provider value={{ documents, userProfile, addDocument, updateDocument, updateUserProfile, deleteDocument, stats, loading, notification, showNotification }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useApp must be used within an AppProvider');
    return context;
};
