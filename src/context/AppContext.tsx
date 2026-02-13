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

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchUserData(session.user.id, session.user.email);
                setupRealtimeSubscription(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
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

        // Live Time Polling (Check every minute for day changes)
        // This ensures "Expires in X days" updates at midnight without refresh
        const timeInterval = setInterval(() => {
            const currentToday = new Date();
            currentToday.setHours(0, 0, 0, 0);

            // Compare with the 'today' used in component scope (we need to store it in state to trigger re-render)
            // For now, we'll force a re-evaluation of alerts/stats by updating a dummy state or just rely on 'checkAndSendAlerts'
            // A simple way is to re-run checkAndSendAlerts if we cross midnight
            checkAndSendAlerts();
        }, 60000); // Check every minute

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
                        // Check if already exists to avoid duplication (if added by this client)
                        if (prevDocs.some(d => d.id === newRecord.id)) return prevDocs;

                        // Map new record to Document type
                        const newDoc: Document = {
                            id: newRecord.id,
                            name: newRecord.name,
                            category: newRecord.category,
                            expiryDate: newRecord.expiry_date,
                            priority: newRecord.priority,
                            notes: newRecord.notes,
                            userGroup: 'Self', // Default
                            alerts: newRecord.alerts_json || { emailSent30: false, emailSent7: false, scheduledAt: '', calendarEventId: '' }
                        };
                        return [...prevDocs, newDoc];

                    case 'UPDATE':
                        return prevDocs.map(doc => {
                            if (doc.id === newRecord.id) {
                                return {
                                    ...doc,
                                    name: newRecord.name,
                                    category: newRecord.category,
                                    expiryDate: newRecord.expiry_date,
                                    priority: newRecord.priority,
                                    notes: newRecord.notes,
                                    alerts: newRecord.alerts_json
                                };
                            }
                            return doc;
                        });

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

    // Request Browser Notification Permission on Mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log("Browser Notifications enabled!");
                }
            });
        }
    }, []);

    // Alert Checker Logic
    useEffect(() => {
        if (!loading && documents.length > 0 && userProfile) {
            checkAndSendAlerts();
        }
    }, [documents, loading, userProfile]);

    const checkAndSendAlerts = async () => {
        console.log("=== EMAIL ALERT CHECK STARTED ===");
        console.log("User email:", userProfile?.email);
        console.log("Documents count:", documents.length);

        for (const doc of documents) {
            const expiry = new Date(doc.expiryDate);
            const expiryUTC = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());

            const today = new Date();
            const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

            const diffMs = expiryUTC - todayUTC;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            console.log(`[Email Check] Doc: "${doc.name}", DaysLeft: ${diffDays}, emailSent30: ${doc.alerts?.emailSent30}, emailSent7: ${doc.alerts?.emailSent7}`);

            let updatedAlerts = { ...doc.alerts };
            let needsUpdate = false;

            // 30 Day Reminder - Send when document is 30 days or less from expiry (but more than 7)
            // The emailSent30 flag ensures it only sends ONCE per document
            if (diffDays <= 30 && diffDays > 7 && !doc.alerts?.emailSent30 && userProfile?.email) {
                console.log(`[30-Day Alert] SENDING for "${doc.name}", daysLeft: ${diffDays}`);
                try {
                    const res = await sendExpiryAlert(userProfile.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    console.log(`[30-Day Alert] Response:`, res);
                    if (res?.success) {
                        updatedAlerts.emailSent30 = true;
                        needsUpdate = true;
                        playAlertSound(); // TRIGGER SOUND HERE

                        if (Notification.permission === 'granted') {
                            new Notification(`📅 Document Duty: ${doc.name}`, {
                                body: `This document expires in ${diffDays} days. Action required!`,
                                icon: '/pwa-192x192.png'
                            });
                        }

                        if (res.isSimulation) {
                            showNotification(`[30d Alert Simulation] Reminder triggered for ${doc.name}`, 'info');
                        } else {
                            showNotification(`[30d Alert] Email reminder sent for ${doc.name}`, 'success');
                        }
                    } else {
                        console.error(`[30-Day Alert] FAILED for "${doc.name}":`, res?.error);
                        showNotification(`[30d Alert] Failed to send email for ${doc.name}: ${(res as any)?.error?.message || 'Unknown error'}`, 'error');
                    }
                } catch (err) {
                    console.error(`[30-Day Alert] EXCEPTION for "${doc.name}":`, err);
                    showNotification(`[30d Alert] Error sending email for ${doc.name}`, 'error');
                }
            }

            // 7 Day Reminder - Send when document is 7 days or less from expiry
            // The emailSent7 flag ensures it only sends ONCE per document
            if (diffDays <= 7 && diffDays >= 0 && !doc.alerts?.emailSent7 && userProfile?.email) {
                console.log(`[7-Day Alert] SENDING for "${doc.name}", daysLeft: ${diffDays}`);
                try {
                    const res = await sendExpiryAlert(userProfile.email, doc.name, diffDays, doc.expiryDate, doc.priority);
                    console.log(`[7-Day Alert] Response:`, res);
                    if (res?.success) {
                        updatedAlerts.emailSent7 = true;
                        needsUpdate = true;
                        playAlertSound(); // TRIGGER SOUND HERE

                        if (Notification.permission === 'granted') {
                            new Notification(`🚨 URGENT: ${doc.name} Expiring!`, {
                                body: `Only ${diffDays} days left! Renew immediately to avoid issues.`,
                                icon: '/pwa-192x192.png',
                                requireInteraction: true
                            });
                        }

                        if (res.isSimulation) {
                            showNotification(`[7d Alert Simulation] Reminder triggered for ${doc.name}`, 'info');
                        } else {
                            showNotification(`[7d Alert] Email reminder sent for ${doc.name}`, 'success');
                        }
                    } else {
                        console.error(`[7-Day Alert] FAILED for "${doc.name}":`, res?.error);
                        showNotification(`[7d Alert] Failed to send email for ${doc.name}: ${(res as any)?.error?.message || 'Unknown error'}`, 'error');
                    }
                } catch (err) {
                    console.error(`[7-Day Alert] EXCEPTION for "${doc.name}":`, err);
                    showNotification(`[7d Alert] Error sending email for ${doc.name}`, 'error');
                }
            }

            if (needsUpdate) {
                console.log(`[Alert Update] Saving alert flags for "${doc.name}"`);
                await supabase.from('documents')
                    .update({ alerts_json: updatedAlerts })
                    .eq('id', doc.id);

                setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, alerts: updatedAlerts } : d));
            }
        }
        console.log("=== EMAIL ALERT CHECK COMPLETE ===");
    };

    const fetchUserData = async (userId: string, authEmail?: string | null) => {
        setLoading(true);
        try {
            // Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profile) {
                // Use profile email, fallback to Google auth email
                const resolvedEmail = (profile.email as string) || authEmail || undefined;
                console.log('[Profile] Loaded email:', resolvedEmail, '(profile:', profile.email, ', auth:', authEmail, ')');

                setUserProfile({
                    fullName: profile.full_name as string,
                    email: resolvedEmail as string,
                    phone: profile.phone as string,
                    dob: profile.dob as string,
                    userGroup: profile.user_group as 'Self' | 'Family' | 'Organization'
                });
            }

            // Fetch Documents
            const { data: docs } = await supabase
                .from('documents')
                .select('*')
                .order('expiry_date', { ascending: true });

            if (docs) {
                const mappedDocs: Document[] = docs.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    category: d.category,
                    expiryDate: d.expiry_date,
                    priority: d.priority,
                    notes: d.notes,
                    userGroup: 'Self', // Default or fetch if needed
                    alerts: d.alerts_json || { emailSent30: false, emailSent7: false, scheduledAt: '', calendarEventId: '' }
                }));
                setDocuments(mappedDocs);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initEmailService();
    }, []);

    const addDocument = async (docData: Omit<Document, 'id' | 'alerts'>) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const newAlerts = {
            emailSent30: false,
            emailSent7: false,
            scheduledAt: new Date().toISOString(),
            calendarEventId: `cal-${uuidv4().slice(0, 8)}`,
        };

        const tempId = uuidv4();
        const newDocConfig: Document = { ...docData, id: tempId, alerts: newAlerts };
        setDocuments((prev: Document[]) => [...prev, newDocConfig]);

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
            console.error('Error adding document:', error);
            return;
        }

        if (data) {
            setDocuments((prev: Document[]) => prev.map((d: Document) => d.id === tempId ? { ...d, id: data.id } : d));

            // Check if initial alert is needed (e.g. if added with date already near)
            checkAndSendAlerts();
        }
    };

    const deleteDocument = async (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) console.error('Error deleting document:', error);
    };

    const updateDocument = async (id: string, updates: Partial<Document>) => {
        // Optimistically update local state
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));

        // Prepare Supabase update object (map camelCase to snake_case)
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
        if (updates.priority) dbUpdates.priority = updates.priority;
        if (updates.notes) dbUpdates.notes = updates.notes;
        if (updates.alerts) dbUpdates.alerts_json = updates.alerts;

        const { error } = await supabase.from('documents').update(dbUpdates).eq('id', id);

        if (error) {
            console.error('Error updating document:', error);
            // Revert on error (could be improved with a fetchUserData, but simple revert for now is complex without previous state. 
            // In a real app we might refetch or use React Query. For now, we log error.)
            showNotification('Failed to update document', 'error');
        } else {
            checkAndSendAlerts(); // Re-check alerts in case date changed
        }
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
        if (documents.length === 0) return { score: 100, insights: ["Welcome! Add your first document to start tracking."] };

        let totalDeduction = 0;
        const insights: string[] = [];

        documents.forEach(doc => {
            const exp = new Date(doc.expiryDate);
            const diffTime = exp.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                totalDeduction += 25; // Expired docs are critical
                if (insights.length < 3) insights.push(`Critical: Your "${doc.name}" has expired. Renew immediately.`);
            } else if (diffDays <= 7) {
                totalDeduction += 15; // Expiring in a week
                if (insights.length < 3) insights.push(`Urgent: "${doc.name}" expires in ${diffDays} days.`);
            } else if (diffDays <= 30) {
                totalDeduction += 5; // Expiring in a month
                if (insights.length < 3 && !insights.some(i => i.includes(doc.name))) {
                    insights.push(`Proactive: Plan to update "${doc.name}" soon.`);
                }
            }
        });

        const score = Math.max(0, 100 - totalDeduction);

        if (score === 100 && documents.length > 0) {
            insights.push("Excellent! All documents are current and secure.");
        } else if (score > 80) {
            insights.push("Vault is healthy. Keep up the regular checks.");
        }

        return { score, insights };
    };

    const vaultHealth = calculateHealthScore();

    const stats = {
        total: documents.length,
        active: documents.filter(d => new Date(d.expiryDate) >= today).length,
        expiringSoon: documents.filter(d => {
            const exp = new Date(d.expiryDate);
            const diffTime = exp.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
