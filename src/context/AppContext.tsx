// Version: 1.2.2 - Final Server Stability & Interface Polish
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
    fileUrl?: string;
    alerts: {
        calendarEventId?: string;
        emailSent30: boolean;
        emailSent7: boolean;
        scheduledAt: string;
    };
}

export interface UserProfile {
    id?: string;
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
                const p: UserProfile = {
                    id: userId,
                    fullName: profile.full_name,
                    email: profile.email || authEmail || '',
                    phone: profile.phone,
                    dob: profile.dob,
                    userGroup: profile.user_group
                };
                setUserProfile(p);
                userProfileRef.current = p;
            } else {
                const shell: UserProfile = { id: userId, fullName: '', email: authEmail || '', phone: '', dob: '', userGroup: 'Self' as const };
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
                    fileUrl: d.file_url || '',
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
        let timeoutId: NodeJS.Timeout;
        let emergencyTimeout: NodeJS.Timeout;
        
        // CRITICAL: Force stop loading after 5 seconds no matter what
        emergencyTimeout = setTimeout(() => {
            console.error('[AppContext] EMERGENCY TIMEOUT (5s) - Forcing loading to stop');
            setLoading(false);
            setAuthError('Connection timeout. Please refresh the page.');
        }, 5000);
        
        const initAuth = async () => {
            try {
                console.log('[AppContext] Initializing authentication...');
                
                // Add timeout to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('Auth timeout')), 3000);
                });
                
                const authPromise = supabase.auth.getSession();
                
                const { data: { session } } = await Promise.race([authPromise, timeoutPromise]) as any;
                
                clearTimeout(timeoutId);
                clearTimeout(emergencyTimeout);
                
                if (!isMounted) return;
                
                console.log('[AppContext] Session:', session ? 'Found' : 'None');
                setSession(session);
                
                if (session?.user) {
                    await fetchUserData(session.user.id, session.user.email);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('[AppContext] Init error:', error);
                clearTimeout(emergencyTimeout);
                if (isMounted) {
                    setAuthError('Failed to initialize. Please refresh the page.');
                    setLoading(false);
                }
            }
        };
        
        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            console.log('[AppContext] Auth state changed:', _event);
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

        // Removed realtime subscription to avoid WebSocket timeout issues
        // Documents will refresh on page load and manual actions

        const interval = setInterval(() => {
            checkAndSendAlerts(documentsRef.current, userProfileRef.current);
        }, 60000);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            clearTimeout(emergencyTimeout);
            subscription.unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const checkAndSendAlerts = async (currentDocs: Document[] | null = null, currentUser: UserProfile | null = null) => {
        if (isCheckingRef.current) {
            console.log('[Alert] Skipping - already checking');
            return;
        }
        isCheckingRef.current = true;

        try {
            const docsToCheck = currentDocs || documentsRef.current;
            const userToCheck = currentUser || userProfileRef.current;
            
            console.log('[Alert] ========================================');
            console.log('[Alert] Starting alert check at:', new Date().toISOString());
            console.log('[Alert] Documents to check:', docsToCheck.length);
            console.log('[Alert] User email:', userToCheck?.email);
            console.log('[Alert] ========================================');
            
            if (!userToCheck?.email) {
                console.warn('[Alert] ❌ No user email - skipping alert check');
                showNotification('Please set your email in Profile to receive alerts', 'info');
                return;
            }
            
            if (docsToCheck.length === 0) {
                console.log('[Alert] No documents to check');
                return;
            }

            let alertsTriggered = 0;

            for (const doc of docsToCheck) {
                const expiryDate = new Date(doc.expiryDate);
                const expiryUTC = Date.UTC(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
                const now = new Date();
                const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
                const diffDays = Math.floor((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));

                console.log(`\n[Alert] 📄 Document: "${doc.name}"`);
                console.log(`[Alert]    Expiry Date: ${doc.expiryDate}`);
                console.log(`[Alert]    Days Until Expiry: ${diffDays} days`);
                console.log(`[Alert]    Priority: ${doc.priority}`);
                console.log(`[Alert]    30-day alert sent: ${doc.alerts.emailSent30}`);
                console.log(`[Alert]    7-day alert sent: ${doc.alerts.emailSent7}`);

                // STRICT: Only alert for 0-30 days. Skip everything else.
                if (diffDays > 30) {
                    console.log(`[Alert]    ⏭️ SKIP: Too far away (${diffDays} > 30 days)`);
                    continue;
                }
                
                if (diffDays < 0) {
                    console.log(`[Alert]    ⏭️ SKIP: Already expired (${Math.abs(diffDays)} days ago)`);
                    continue;
                }

                let updatedAlerts = { ...doc.alerts };
                let triggerUpdate = false;

                // ===== 30-DAY ALERT (8-30 days remaining) =====
                const key30 = `${doc.id}-30`;
                if (diffDays <= 30 && diffDays > 7 && !doc.alerts.emailSent30 && !alertedThisSession.has(key30)) {
                    console.log(`[Alert]    🔔 30-DAY ALERT TRIGGERED! (${diffDays} days remaining)`);
                    
                    // Mark in session immediately to prevent re-trigger
                    alertedThisSession.add(key30);
                    alertsTriggered++;

                    // Play sound IMMEDIATELY (Non-blocking)
                    console.log('[Alert]    🔊 Playing 15-second alert sound...');
                    const soundPlayed = playAlertSound();
                    if (!soundPlayed) {
                        console.warn('[Alert]    ⚠️ Sound blocked - user needs to interact with page first');
                        showNotification('Click anywhere to enable sound alerts', 'info');
                    } else {
                        console.log('[Alert]    ✅ Sound playing successfully');
                    }

                    // Send email (Wait for result to update DB)
                    console.log('[Alert]    📧 Sending 30-day email to:', userToCheck.email);
                    const res = await sendExpiryAlert(userToCheck.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    
                    if (res.success) {
                        console.log(`[Alert]    ✅ 30-day email sent successfully!`);
                        showNotification(`✅ 30-day alert sent for: ${doc.name}`, 'success');
                        updatedAlerts.emailSent30 = true;
                        triggerUpdate = true;
                    } else {
                        console.error(`[Alert]    ❌ 30-day email FAILED:`, res.error);
                        showNotification(`❌ Email failed: ${res.error}`, 'error');
                        alertedThisSession.delete(key30);
                    }
                }

                // ===== 7-DAY ALERT (0-7 days remaining) =====
                const key7 = `${doc.id}-7`;
                if (diffDays <= 7 && diffDays >= 0 && !doc.alerts.emailSent7 && !alertedThisSession.has(key7)) {
                    console.log(`[Alert]    🚨 7-DAY URGENT ALERT TRIGGERED! (${diffDays} days remaining)`);
                    
                    // Mark in session immediately to prevent re-trigger
                    alertedThisSession.add(key7);
                    alertsTriggered++;

                    // Play sound IMMEDIATELY (Non-blocking)
                    console.log('[Alert]    🔊 Playing 15-second URGENT sound...');
                    const soundPlayed = playAlertSound();
                    if (!soundPlayed) {
                        console.warn('[Alert]    ⚠️ Sound blocked - user needs to interact with page first');
                        showNotification('Click anywhere to enable sound alerts', 'info');
                    } else {
                        console.log('[Alert]    ✅ Sound playing successfully');
                    }

                    // Send email (Wait for result to update DB)
                    console.log('[Alert]    📧 Sending 7-day URGENT email to:', userToCheck.email);
                    const res = await sendExpiryAlert(userToCheck.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    
                    if (res.success) {
                        console.log(`[Alert]    ✅ 7-day URGENT email sent successfully!`);
                        showNotification(`🚨 URGENT alert sent for: ${doc.name}`, 'success');
                        updatedAlerts.emailSent7 = true;
                        triggerUpdate = true;
                    } else {
                        console.error(`[Alert]    ❌ 7-day email FAILED:`, res.error);
                        showNotification(`❌ Email failed: ${res.error}`, 'error');
                        alertedThisSession.delete(key7);
                    }
                }

                if (triggerUpdate) {
                    console.log(`[Alert]    💾 Updating database...`);
                    await supabase.from('documents').update({ alerts_json: updatedAlerts }).eq('id', doc.id);
                    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, alerts: updatedAlerts } : d));
                    console.log(`[Alert]    ✅ Database updated successfully`);
                }
            }
            
            console.log('\n[Alert] ========================================');
            console.log(`[Alert] Alert check complete! Alerts triggered: ${alertsTriggered}`);
            console.log('[Alert] ========================================\n');
            
            if (alertsTriggered === 0) {
                console.log('[Alert] ℹ️ No alerts needed at this time');
            }
        } catch (err) {
            console.error('[Alert] ❌ Check error:', err);
            showNotification('Alert check failed - see console for details', 'error');
        } finally {
            isCheckingRef.current = false;
        }
    };

    const addDocument = async (docData: Omit<Document, 'id' | 'alerts'>) => {
        console.log('[AddDocument] Starting document save...', docData);
        
        const userRes = await supabase.auth.getUser();
        const user = userRes.data.user;
        
        if (!user) {
            console.error('[AddDocument] No authenticated user found!');
            showNotification('Please log in to add documents', 'error');
            return null;
        }
        
        console.log('[AddDocument] User authenticated:', user.id);

        const newAlerts = { emailSent30: false, emailSent7: false, scheduledAt: new Date().toISOString(), calendarEventId: uuidv4() };
        // Try with user_group first, fallback to without it
        let insertPayload: any = {
            user_id: user.id,
            name: docData.name,
            category: docData.category,
            expiry_date: docData.expiryDate,
            priority: docData.priority,
            notes: docData.notes,
            file_url: docData.fileUrl || null,
            alerts_json: newAlerts
        };
        
        console.log('[AddDocument] Insert payload (without user_group):', insertPayload);

        let { data, error } = await supabase.from('documents').insert(insertPayload).select().single();

        if (error) {
            console.error('[AddDocument] Database error:', error);
            showNotification(`Save failed: ${error.message}`, 'error');
            return null;
        }
        
        console.log('[AddDocument] Document saved successfully:', data);

        const saved: Document = { ...docData, id: data.id, alerts: newAlerts };
        setDocuments(prev => {
            const updated = [...prev, saved];
            console.log('[AddDocument] Updated documents list:', updated.length, 'documents');
            return updated;
        });
        
        showNotification(`Document "${docData.name}" saved successfully!`, 'success');
        
        // Trigger alert check immediately
        console.log('[AddDocument] Triggering alert check...');
        setTimeout(() => {
            checkAndSendAlerts([...documentsRef.current, saved], userProfileRef.current);
        }, 1000);
        
        return saved;
    };

    const updateDocument = async (id: string, updates: Partial<Document>) => {
        // Map camelCase to snake_case for database
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.userGroup !== undefined) dbUpdates.user_group = updates.userGroup;
        if (updates.fileUrl !== undefined) dbUpdates.file_url = updates.fileUrl;
        if (updates.alerts !== undefined) dbUpdates.alerts_json = updates.alerts;

        const { error } = await supabase.from('documents').update(dbUpdates).eq('id', id);
        if (error) {
            console.error('[UpdateDocument] Error:', error);
            return false;
        }
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
