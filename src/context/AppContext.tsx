// Version: 1.2.1 - Build Stabilization
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
    session: any | null;
    authError: string | null;
    notification: { message: string, type: 'success' | 'info' | 'error' } | null;
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
    refreshAlerts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// SESSION-LEVEL dedup: prevents repeated alerts even if DB update fails
const alertedThisSession = new Set<string>();

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const documentsRef = React.useRef(documents);
    const userProfileRef = React.useRef(userProfile);
    const isCheckingRef = React.useRef(false);
    const isFetchingRef = React.useRef(false);

    useEffect(() => {
        documentsRef.current = documents;
    }, [documents]);

    useEffect(() => {
        userProfileRef.current = userProfile;
    }, [userProfile]);

    const fetchUserData = async (userId: string, authEmail?: string | null) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoading(true);
        setAuthError(null);
        try {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (profile) {
                const p = {
                    fullName: profile.full_name,
                    email: profile.email || authEmail || '',
                    phone: profile.phone,
                    dob: profile.dob,
                    userGroup: profile.user_group
                };
                setUserProfile(p);
                userProfileRef.current = p;
            } else {
                const shell = { fullName: '', email: authEmail || '', phone: '', dob: '', userGroup: 'Self' as const };
                setUserProfile(shell);
                userProfileRef.current = shell;
            }

            const { data: docs } = await supabase.from('documents').select('*').order('expiry_date', { ascending: true });
            if (docs) {
                const mappedDocs: Document[] = docs.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    category: d.category,
                    expiryDate: d.expiry_date,
                    priority: d.priority as any,
                    notes: d.notes,
                    userGroup: d.user_group || 'Self',
                    alerts: d.alerts_json || { emailSent30: false, emailSent7: false, scheduledAt: '', calendarEventId: '' }
                }));
                setDocuments(mappedDocs);
                documentsRef.current = mappedDocs;
                for (const doc of mappedDocs) {
                    if (doc.alerts.emailSent30) alertedThisSession.add(`${doc.id}-30`);
                    if (doc.alerts.emailSent7) alertedThisSession.add(`${doc.id}-7`);
                }
                setTimeout(() => checkAndSendAlerts(mappedDocs, userProfileRef.current), 2000);
            }
        } catch (error: any) {
            console.error('[AppContext] Fetch error:', error);
            setAuthError(error.message || 'Data fetch failed');
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!isMounted) return;
            setSession(session);
            if (session?.user) {
                await fetchUserData(session.user.id, session.user.email);
            } else {
                setLoading(false);
            }
        };
        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            setSession(session);
            if (session?.user) {
                fetchUserData(session.user.id, session.user.email);
            } else {
                setDocuments([]);
                setUserProfile(null);
                setLoading(false);
                setAuthError(null);
            }
        });

        const channel = supabase.channel('db_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
            if (isMounted) {
                supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
                    if (currentSession?.user?.id) fetchUserData(currentSession.user.id, currentSession.user.email);
                });
            }
        }).subscribe();

        const interval = setInterval(() => {
            checkAndSendAlerts(documentsRef.current, userProfileRef.current);
        }, 60000);

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, []);

    const checkAndSendAlerts = async (currentDocs: Document[] | null = null, currentUser: UserProfile | null = null) => {
        if (isCheckingRef.current) return;
        isCheckingRef.current = true;

        try {
            const docsToCheck = currentDocs || documentsRef.current;
            const userToCheck = currentUser || userProfileRef.current;
            if (!userToCheck?.email || docsToCheck.length === 0) return;

            for (const doc of docsToCheck) {
                const expiryDate = new Date(doc.expiryDate);
                const expiryUTC = Date.UTC(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
                const now = new Date();
                const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
                const diffDays = Math.floor((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));

                if (diffDays > 30 || diffDays < 0) continue;

                let updatedAlerts = { ...doc.alerts };
                let triggerUpdate = false;

                const key30 = `${doc.id}-30`;
                if (diffDays <= 30 && diffDays > 7 && !doc.alerts.emailSent30 && !alertedThisSession.has(key30)) {
                    alertedThisSession.add(key30);
                    playAlertSound();
                    const res = await sendExpiryAlert(userToCheck.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    if (res.success) {
                        showNotification(`30-day alert: ${doc.name} sent!`, 'success');
                        updatedAlerts.emailSent30 = true;
                        triggerUpdate = true;
                    } else {
                        alertedThisSession.delete(key30);
                    }
                }

                const key7 = `${doc.id}-7`;
                if (diffDays <= 7 && !doc.alerts.emailSent7 && !alertedThisSession.has(key7)) {
                    alertedThisSession.add(key7);
                    playAlertSound();
                    const res = await sendExpiryAlert(userToCheck.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    if (res.success) {
                        showNotification(`URGENT: ${doc.name} alert sent!`, 'success');
                        updatedAlerts.emailSent7 = true;
                        triggerUpdate = true;
                    } else {
                        alertedThisSession.delete(key7);
                    }
                }

                if (triggerUpdate) {
                    await supabase.from('documents').update({ alerts_json: updatedAlerts }).eq('id', doc.id);
                    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, alerts: updatedAlerts } : d));
                }
            }
        } catch (err) {
            console.error('[Alert] Check error:', err);
        } finally {
            isCheckingRef.current = false;
        }
    };

    const addDocument = async (docData: Omit<Document, 'id' | 'alerts'>) => {
        const userRes = await supabase.auth.getUser();
        const user = userRes.data.user;
        if (!user) return null;

        const newAlerts = { emailSent30: false, emailSent7: false, scheduledAt: new Date().toISOString(), calendarEventId: uuidv4() };
        let insertPayload: any = {
            user_id: user.id,
            name: docData.name,
            category: docData.category,
            expiry_date: docData.expiryDate,
            priority: docData.priority,
            notes: docData.notes,
            alerts_json: newAlerts,
            user_group: docData.userGroup
        };

        let { data, error } = await supabase.from('documents').insert(insertPayload).select().single();

        if (error && error.message.includes('column "user_group"')) {
            const { user_group: _group, ...minimalPayload } = insertPayload;
            const retry = await supabase.from('documents').insert(minimalPayload).select().single();
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            showNotification(`Save failed: ${error.message}`, 'error');
            return null;
        }

        const saved: Document = { ...docData, id: data.id, alerts: newAlerts };
        setDocuments(prev => [...prev, saved]);
        checkAndSendAlerts([...documentsRef.current, saved], userProfileRef.current);
        return saved;
    };

    const updateDocument = async (id: string, updates: Partial<Document>) => {
        const { error } = await supabase.from('documents').update(updates).eq('id', id);
        if (error) return false;
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
        return true;
    };

    const updateUserProfile = async (profile: UserProfile) => {
        const userRes = await supabase.auth.getUser();
        const user = userRes.data.user;
        if (!user) return;
        setUserProfile(profile);
        await supabase.from('profiles').upsert({
            id: user.id,
            full_name: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            user_group: profile.userGroup,
            dob: profile.dob
        });
    };

    const deleteDocument = async (id: string) => {
        await supabase.from('documents').delete().eq('id', id);
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const refreshAlerts = async () => {
        showNotification('Checking...', 'info');
        await checkAndSendAlerts(documentsRef.current, userProfileRef.current);
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
            loading, notification, showNotification, refreshAlerts, session, authError
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
