import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabaseClient';
import { sendExpiryAlert } from '../utils/emailService';
import { playAlertSound } from '../utils/soundUtils';

export interface Document {
    id: string;
    name: string;
    category: string;
    expiryDate: string;
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
    stats: { total: number; active: number; expiringSoon: number; expired: number; };
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

    // Use a ref to access the latest documents inside the interval without resetting it constantly
    const documentsRef = React.useRef(documents);
    const userProfileRef = React.useRef(userProfile);

    useEffect(() => {
        documentsRef.current = documents;
    }, [documents]);

    useEffect(() => {
        userProfileRef.current = userProfile;
    }, [userProfile]);

    const fetchUserData = async (userId: string, authEmail?: string | null) => {
        setLoading(true);
        try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (profile) {
                setUserProfile({
                    fullName: profile.full_name,
                    email: profile.email || authEmail || '',
                    phone: profile.phone,
                    dob: profile.dob,
                    userGroup: profile.user_group
                });
            }
            const { data: docs } = await supabase.from('documents').select('*').order('expiry_date', { ascending: true });
            if (docs) {
                const mappedDocs = docs.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    category: d.category,
                    expiryDate: d.expiry_date,
                    priority: d.priority as any,
                    notes: d.notes,
                    userGroup: 'Self',
                    alerts: d.alerts_json || { emailSent30: false, emailSent7: false, scheduledAt: '', calendarEventId: '' }
                }));
                // TypeScript fix: ensure mappedDocs is treated as correct type if needed, but here it matches
                setDocuments(mappedDocs as Document[]);

                // Immediate check after fetching
                setTimeout(() => checkAndSendAlerts(mappedDocs as Document[], userProfileRef.current), 2000);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) fetchUserData(session.user.id, session.user.email);
            else setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) fetchUserData(session.user.id, session.user.email);
            else { setDocuments([]); setUserProfile(null); setLoading(false); }
        });

        // Check every minute
        const interval = setInterval(() => {
            checkAndSendAlerts(documentsRef.current, userProfileRef.current);
        }, 60000);

        return () => { subscription.unsubscribe(); clearInterval(interval); };
    }, []);

    const checkAndSendAlerts = async (currentDocs: Document[] | null = null, currentUser: UserProfile | null = null) => {
        const docsToCheck = currentDocs || documents;
        const userToCheck = currentUser || userProfile;

        if (!userToCheck?.email || docsToCheck.length === 0) return;
        const now = new Date();
        const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

        for (const doc of docsToCheck) {
            const expiry = new Date(doc.expiryDate);
            const expiryUTC = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
            const diffDays = Math.floor((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));

            if (diffDays <= 30 && diffDays >= 0) {
                let updatedAlerts = { ...doc.alerts };
                let triggerUpdate = false;

                // 30-Day Alert
                if (diffDays <= 30 && diffDays > 7 && !doc.alerts.emailSent30) {
                    playAlertSound();
                    await sendExpiryAlert(userToCheck.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    updatedAlerts.emailSent30 = true;
                    triggerUpdate = true;
                    showNotification(`30-day alert for ${doc.name}`, 'success');
                }

                // 7-Day Alert (Urgent)
                if (diffDays <= 7 && !doc.alerts.emailSent7) {
                    playAlertSound();
                    await sendExpiryAlert(userToCheck.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    updatedAlerts.emailSent7 = true;
                    triggerUpdate = true;
                    showNotification(`URGENT 7-day alert for ${doc.name}`, 'error');
                }

                if (triggerUpdate) {
                    await supabase.from('documents').update({ alerts_json: updatedAlerts }).eq('id', doc.id);
                    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, alerts: updatedAlerts } : d));
                }
            }
        }
    };

    const addDocument = async (docData: Omit<Document, 'id' | 'alerts'>) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return null;
        const newAlerts = { emailSent30: false, emailSent7: false, scheduledAt: new Date().toISOString(), calendarEventId: uuidv4() };
        const { data, error } = await supabase.from('documents').insert({
            user_id: user.id,
            name: docData.name,
            category: docData.category,
            expiry_date: docData.expiryDate,
            priority: docData.priority,
            notes: docData.notes,
            alerts_json: newAlerts
        }).select().single();
        if (error) return null;
        const saved = { ...docData, id: data.id, alerts: newAlerts };
        setDocuments(prev => [...prev, saved]);
        // Trigger check with new state
        checkAndSendAlerts([...documents, saved], userProfileRef.current);
        return saved;
    };

    const updateDocument = async (id: string, updates: Partial<Document>) => {
        const { error } = await supabase.from('documents').update(updates).eq('id', id);
        if (error) return false;
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
        return true;
    };

    const updateUserProfile = async (profile: UserProfile) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;
        setUserProfile(profile);
        await supabase.from('profiles').upsert({ id: user.id, full_name: profile.fullName, email: profile.email, phone: profile.phone, user_group: profile.userGroup, dob: profile.dob });
    };

    const deleteDocument = async (id: string) => {
        await supabase.from('documents').delete().eq('id', id);
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    return (
        <AppContext.Provider value={{
            documents, userProfile, addDocument, updateDocument, updateUserProfile, deleteDocument,
            stats: {
                total: documents.length,
                active: documents.filter(d => new Date(d.expiryDate) >= new Date()).length,
                expiringSoon: documents.filter(d => {
                    const diffDays = Math.ceil((new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 7;
                }).length,
                expired: documents.filter(d => new Date(d.expiryDate) < new Date()).length
            },
            loading, notification, showNotification
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
