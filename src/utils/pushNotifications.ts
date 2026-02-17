// Web Push Notifications Service
// Sends browser notifications even when the app is closed

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'; // Will be generated

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
    actions?: Array<{
        action: string;
        title: string;
    }>;
}

class PushNotificationService {
    private registration: ServiceWorkerRegistration | null = null;
    private subscription: PushSubscription | null = null;

    // Check if push notifications are supported
    isSupported(): boolean {
        return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    }

    // Request permission from user
    async requestPermission(): Promise<NotificationPermission> {
        if (!this.isSupported()) {
            console.warn('[Push] Push notifications not supported');
            return 'denied';
        }

        const permission = await Notification.requestPermission();
        console.log('[Push] Permission:', permission);
        return permission;
    }

    // Register service worker
    async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
        if (!this.isSupported()) {
            return null;
        }

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('[Push] Service Worker registered:', this.registration);
            return this.registration;
        } catch (error) {
            console.error('[Push] Service Worker registration failed:', error);
            return null;
        }
    }

    // Subscribe to push notifications
    async subscribe(): Promise<PushSubscription | null> {
        if (!this.registration) {
            await this.registerServiceWorker();
        }

        if (!this.registration) {
            return null;
        }

        try {
            // Check if already subscribed
            this.subscription = await this.registration.pushManager.getSubscription();

            if (!this.subscription) {
                // Create new subscription
                this.subscription = await this.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
                console.log('[Push] Subscribed:', this.subscription);

                // Send subscription to backend
                await this.sendSubscriptionToBackend(this.subscription);
            }

            return this.subscription;
        } catch (error) {
            console.error('[Push] Subscription failed:', error);
            return null;
        }
    }

    // Unsubscribe from push notifications
    async unsubscribe(): Promise<boolean> {
        if (!this.subscription) {
            return false;
        }

        try {
            await this.subscription.unsubscribe();
            console.log('[Push] Unsubscribed');
            this.subscription = null;
            return true;
        } catch (error) {
            console.error('[Push] Unsubscribe failed:', error);
            return false;
        }
    }

    // Send local notification (works when app is open)
    async sendLocalNotification(payload: PushNotificationPayload): Promise<void> {
        if (!this.isSupported()) {
            return;
        }

        const permission = await this.requestPermission();
        if (permission !== 'granted') {
            return;
        }

        if (!this.registration) {
            await this.registerServiceWorker();
        }

        if (this.registration) {
            await this.registration.showNotification(payload.title, {
                body: payload.body,
                icon: payload.icon || '/icon-192x192.png',
                badge: payload.badge || '/icon-192x192.png',
                data: payload.data,
                actions: payload.actions,
                vibrate: [200, 100, 200],
                tag: 'document-expiry',
                requireInteraction: true
            });
        }
    }

    // Initialize push notifications
    async initialize(): Promise<boolean> {
        if (!this.isSupported()) {
            console.warn('[Push] Push notifications not supported in this browser');
            return false;
        }

        const permission = await this.requestPermission();
        if (permission !== 'granted') {
            console.warn('[Push] Notification permission denied');
            return false;
        }

        await this.registerServiceWorker();
        await this.subscribe();

        return true;
    }

    // Helper: Convert VAPID key
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Send subscription to backend
    private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
        try {
            // Store subscription in localStorage for now
            // In production, send to your backend
            localStorage.setItem('push-subscription', JSON.stringify(subscription));
            console.log('[Push] Subscription saved');
        } catch (error) {
            console.error('[Push] Failed to save subscription:', error);
        }
    }

    // Get current subscription status
    async getSubscriptionStatus(): Promise<{
        supported: boolean;
        permission: NotificationPermission;
        subscribed: boolean;
    }> {
        const supported = this.isSupported();
        const permission = supported ? Notification.permission : 'denied';
        
        let subscribed = false;
        if (supported && this.registration) {
            const sub = await this.registration.pushManager.getSubscription();
            subscribed = !!sub;
        }

        return { supported, permission, subscribed };
    }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Helper function to send document expiry notification
export async function sendDocumentExpiryNotification(
    documentName: string,
    daysLeft: number,
    category: string
): Promise<void> {
    const urgency = daysLeft <= 7 ? 'URGENT' : 'REMINDER';
    const emoji = daysLeft <= 7 ? '🚨' : '⏰';

    await pushNotificationService.sendLocalNotification({
        title: `${emoji} ${urgency}: Document Expiring`,
        body: `${documentName} (${category}) expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!`,
        icon: '/icon-192x192.png',
        data: {
            documentName,
            daysLeft,
            category,
            url: '/dashboard'
        },
        actions: [
            { action: 'view', title: 'View Document' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    });
}
