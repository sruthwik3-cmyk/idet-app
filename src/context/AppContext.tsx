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
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
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
    addDocument: (doc: Omit<Document, 'id' | 'alerts'>) => void;
    updateDocument: (id: string, updates: Partial<Document>) => void;
    updateUserProfile: (profile: UserProfile) => void;
    deleteDocument: (id: string) => void;
    stats: {
        total: number;
        active: number;
        expiringSoon: number;
        expired: number;
        healthScore: number;
        insights: string[];
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
        for (const doc of documents) {
            const expiry = new Date(doc.expiryDate);
            const expiryUTC = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
            const today = new Date();
            const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
            const diffDays = Math.floor((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));

            let updatedAlerts = { ...doc.alerts };
            let needsUpdate = false;

            if (diffDays <= 30 && diffDays > 7 && !doc.alerts?.emailSent30 && userProfile?.email) {
                const res = await sendExpiryAlert(userProfile.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                if (res?.success) {
                    updatedAlerts.emailSent30 = true;
                    needsUpdate = true;
                    playAlertSound();
                    if (Notification.permission === 'granted') {
                        new Notification(`📅 Document Duty: ${doc.name}`, { body: `Expires in ${diffDays} days.`, icon: '/pwa-192x192.png' });
                    }
                    showNotification(res.isSimulation ? `Reminder triggered for ${doc.name}` : `Email sent for ${doc.name}`, 'success');
                }
            }

            if (diffDays <= 7 && diffDays >= 0 && !doc.alerts?.emailSent7 && userProfile?.email) {
                const res = await sendExpiryAlert(userProfile.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                if (res?.success) {
                    updatedAlerts.emailSent7 = true;
                    needsUpdate = true;
                    playAlertSound();
                    if (Notification.permission === 'granted') {
                        new Notification(`🚨 URGENT: ${doc.name}`, { body: `Only ${diffDays} days left!`, icon: '/pwa-192x192.png', requireInteraction: true });
                    }
                    showNotification(res.isSimulation ? `Urgent reminder for ${doc.name}` : `Urgent email sent for ${doc.name}`, 'success');
                }
            }

            if (needsUpdate) {
                await supabase.from('documents').update({ alerts_json: updatedAlerts }).eq('id', doc.id);
                setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, alerts: updatedAlerts } : d));
            }
        }
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

    const addDocument = async (docData: Omit<Document, 'id' | 'alerts'>) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;
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
        if (data && !error) {
            setDocuments(prev => [...prev, { ...docData, id: data.id, alerts: newAlerts }]);
            checkAndSendAlerts();
            playAlertSound(); // TRIGGER SOUND UPON ADDING DOCUMENT
        }
    };

    const deleteDocument = async (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
        await supabase.from('documents').delete().eq('id', id);
    };

    const updateDocument = async (id: string, updates: Partial<Document>) => {
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
        if (updates.priority) dbUpdates.priority = updates.priority;
        if (updates.notes) dbUpdates.notes = updates.notes;
        if (updates.alerts) dbUpdates.alerts_json = updates.alerts;
        await supabase.from('documents').update(dbUpdates).eq('id', id);
        checkAndSendAlerts();
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

    const calculateHealthScore = () => {
        if (documents.length === 0) return { score: 100, insights: ["Welcome! Add your first document."] };
        let totalDeduction = 0;
        const insights: string[] = [];
        documents.forEach(doc => {
            const exp = new Date(doc.expiryDate);
            const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) {
                totalDeduction += 25;
                if (insights.length < 3) insights.push(`Critical: "${doc.name}" has expired.`);
            } else if (diffDays <= 7) {
                totalDeduction += 15;
                if (insights.length < 3) insights.push(`Urgent: "${doc.name}" expires in ${diffDays} days.`);
            } else if (diffDays <= 30) {
                totalDeduction += 5;
                if (insights.length < 3 && !insights.some(i => i.includes(doc.name))) insights.push(`Plan to update "${doc.name}" soon.`);
            }
        });
        const score = Math.max(0, 100 - totalDeduction);
        if (score === 100 && documents.length > 0) insights.push("Excellent! All documents are secure.");
        else if (score > 80) insights.push("Vault is healthy.");
        return { score, insights };
    };

    const vaultHealth = calculateHealthScore();
    const stats = {
        total: documents.length,
        active: documents.filter(d => new Date(d.expiryDate) >= today).length,
        expiringSoon: documents.filter(d => {
            const diffDays = Math.ceil((new Date(d.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        }).length,
        expired: documents.filter(d => new Date(d.expiryDate) < today).length,
        healthScore: vaultHealth.score,
        insights: vaultHealth.insights
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
