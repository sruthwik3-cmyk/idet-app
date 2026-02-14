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
    refreshAlerts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// SESSION-LEVEL dedup: prevents repeated alerts even if DB update fails
// This Set tracks "docId-alertType" strings that have been alerted this session
const alertedThisSession = new Set<string>();

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    // Refs for latest state inside intervals
    const documentsRef = React.useRef(documents);
    const userProfileRef = React.useRef(userProfile);
    // Guard to prevent concurrent alert checks
    const isCheckingRef = React.useRef(false);

    useEffect(() => {
        documentsRef.current = documents;
    }, [documents]);

    useEffect(() => {
        userProfileRef.current = userProfile;
    }, [userProfile]);

    const fetchUserData = async (userId: string, authEmail?: string | null) => {
        console.log(`[Auth] fetchUserData started for ${userId} (${authEmail})`);

        // Phase 1: Ensure we have at least a shell profile immediately
        // This stops the redirect loop from login to dashboard
        setUserProfile(prev => {
            if (prev) return prev; // Keep existing if we have it
            return {
                fullName: '',
                email: authEmail || '',
                phone: '',
                dob: '',
                userGroup: 'Self'
            };
        });

        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    console.log('[Auth] Profile record not in DB yet (New User)');
                } else {
                    console.error('[Auth] Profile fetch error:', profileError);
                }
            }

            if (profile) {
                console.log('[Auth] Profile found, updating state');
                setUserProfile({
                    fullName: profile.full_name,
                    email: profile.email || authEmail || '',
                    phone: profile.phone,
                    dob: profile.dob,
                    userGroup: profile.user_group
                });
            }

            // Phase 2: Fetch documents
            console.log('[Auth] Fetching documents...');
            const { data: docs, error: docsError } = await supabase
                .from('documents')
                .select('*')
                .order('expiry_date', { ascending: true });

            if (docsError) {
                console.error('[Auth] Documents fetch error:', docsError);
            }

            if (docs) {
                const mappedDocs = docs.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    category: d.category,
                    expiryDate: d.expiry_date,
                    priority: d.priority as any,
                    notes: d.notes,
                    userGroup: d.user_group || 'Self',
                    alerts: d.alerts_json || { emailSent30: false, emailSent7: false, scheduledAt: '', calendarEventId: '' }
                }));
                setDocuments(mappedDocs as Document[]);

                // Pre-populate session dedup set for docs that already have flags set in DB
                for (const doc of mappedDocs) {
                    if (doc.alerts.emailSent30) alertedThisSession.add(`${doc.id}-30`);
                    if (doc.alerts.emailSent7) alertedThisSession.add(`${doc.id}-7`);
                }

                // Immediate check 2 seconds after fetching data
                // Pass the newly created profile object directly to avoid ref race conditions
                const newProfile: UserProfile = {
                    fullName: profile?.full_name || '',
                    email: profile?.email || authEmail || '',
                    phone: profile?.phone || '',
                    dob: profile?.dob || '',
                    userGroup: profile?.user_group || 'Self'
                };
                setTimeout(() => checkAndSendAlerts(mappedDocs as Document[], newProfile), 2000);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[Auth] Main useEffect mounting');

        let isInitial = true;

        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[Auth] getSession checked:', session ? 'User present' : 'No session');
            if (session?.user) {
                fetchUserData(session.user.id, session.user.email);
            } else if (isInitial) {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[Auth] onAuthStateChange: ${event}`);
            isInitial = false;

            if (session?.user) {
                fetchUserData(session.user.id, session.user.email);
            } else if (event === 'SIGNED_OUT') {
                setDocuments([]);
                setUserProfile(null);
                setLoading(false);
            } else {
                // For INITIAL_SESSION or other non-user events
                setLoading(false);
            }
        });

        // Check every 60 seconds
        const interval = setInterval(() => {
            checkAndSendAlerts(documentsRef.current, userProfileRef.current);
        }, 60000);

        return () => { subscription.unsubscribe(); clearInterval(interval); };
    }, []);

    useEffect(() => {
        console.log("[Config] System is using Backend Gmail API (REST) mode.");
    }, []);

    const checkAndSendAlerts = async (currentDocs: Document[] | null = null, currentUser: UserProfile | null = null) => {
        // Prevent concurrent runs
        if (isCheckingRef.current) {
            console.log('[Alert] Skipping - already checking');
            return;
        }
        isCheckingRef.current = true;

        try {
            const docsToCheck = currentDocs || documents;
            const userToCheck = currentUser || userProfile;

            if (!userToCheck?.email) {
                console.log('[Alert] No user email yet, skipping check');
                return;
            }

            if (docsToCheck.length === 0) {
                console.log('[Alert] No documents to check');
                return;
            }

            const now = new Date();
            // Set both dates to noon to avoid edge-of-day timezone issues
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

            for (const doc of docsToCheck) {
                try {
                    const expiryRaw = new Date(doc.expiryDate);
                    const expiry = new Date(expiryRaw.getFullYear(), expiryRaw.getMonth(), expiryRaw.getDate(), 12, 0, 0);
                    const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    // STRICT: Only alert for 0-30 days. Skip everything else.
                    if (diffDays > 30 || diffDays < 0) continue;

                    let updatedAlerts = { ...doc.alerts };
                    let triggerUpdate = false;

                    // ===== 30-DAY ALERT (8-30 days remaining) =====
                    const key30 = `${doc.id}-30`;
                    if (diffDays <= 30 && diffDays > 7 && !doc.alerts.emailSent30 && !alertedThisSession.has(key30)) {
                        console.log(`[Alert] *** 30-DAY TRIGGER for "${doc.name}" (${diffDays} days left) ***`);

                        // Mark in session immediately to prevent re-trigger
                        alertedThisSession.add(key30);

                        // Play sound IMMEDIATELY (Non-blocking)
                        playAlertSound();

                        // Send email (Wait for result to update DB)
                        const emailRes = await sendExpiryAlert(userToCheck.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                        console.log(`[Alert] Email result for "${doc.name}":`, JSON.stringify(emailRes));

                        if (emailRes.success) {
                            showNotification(`30-day alert: ${doc.name} - Email sent!`, 'success');
                            updatedAlerts.emailSent30 = true;
                            triggerUpdate = true;
                        } else {
                            showNotification(`30-day alert: ${doc.name} (email issue: ${emailRes.error || 'unknown'})`, 'error');
                            // DO NOT set emailSent30 to true, allow retry on next check
                            alertedThisSession.delete(key30);
                        }
                    }

                    // ===== 7-DAY ALERT (0-7 days remaining) =====
                    const key7 = `${doc.id}-7`;
                    if (diffDays <= 7 && !doc.alerts.emailSent7 && !alertedThisSession.has(key7)) {
                        console.log(`[Alert] *** 7-DAY URGENT TRIGGER for "${doc.name}" (${diffDays} days left) ***`);

                        // Mark in session immediately
                        alertedThisSession.add(key7);

                        // Play sound IMMEDIATELY
                        playAlertSound();

                        // Send email
                        const emailRes = await sendExpiryAlert(userToCheck.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                        console.log(`[Alert] Email result for "${doc.name}":`, JSON.stringify(emailRes));

                        if (emailRes.success) {
                            showNotification(`URGENT 7-day alert: ${doc.name} - Email sent!`, 'success');
                            updatedAlerts.emailSent7 = true;
                            triggerUpdate = true;
                        } else {
                            showNotification(`URGENT: ${doc.name} expires in ${diffDays}d (email issue: ${emailRes.error || 'unknown'})`, 'error');
                            // DO NOT set emailSent7 to true, allow retry
                            alertedThisSession.delete(key7);
                        }
                    }

                    // Update DB so it persists across sessions
                    if (triggerUpdate) {
                        const { error: dbError } = await supabase.from('documents').update({ alerts_json: updatedAlerts }).eq('id', doc.id);
                        if (dbError) {
                            console.error(`[Alert] DB update FAILED for "${doc.name}":`, dbError.message);
                        } else {
                            console.log(`[Alert] DB updated OK for "${doc.name}"`);
                        }
                        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, alerts: updatedAlerts } : d));
                    }
                } catch (docError) {
                    console.error(`[Alert] Error processing document "${doc.name}":`, docError);
                }
            }
        } finally {
            isCheckingRef.current = false;
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
            user_group: docData.userGroup,
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

    const refreshAlerts = async () => {
        showNotification('Checking for alerts...', 'info');
        await checkAndSendAlerts(documents, userProfile);
        showNotification('Alert check complete', 'success');
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
            loading, notification, showNotification, refreshAlerts
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
