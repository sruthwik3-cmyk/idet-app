import { generateCalendarUrl } from './calendarUtils';

export const sendExpiryAlert = async (toEmail: string, docName: string, daysLeft: number, expiryDateStr: string, priority: string = 'Important') => {
    const subject = daysLeft <= 7 ? `🚨 URGENT: ${docName} expires in ${daysLeft} days!` : `Reminder: ${docName} Expiry Alert (${daysLeft}d)`;
    const calendarUrl = generateCalendarUrl(docName, expiryDateStr, priority);

    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Document Expiry Alert</h2>
            <p>Your document <strong>${docName}</strong> expires on <strong>${new Date(expiryDateStr).toLocaleDateString()}</strong>.</p>
            <p><strong>Days Left:</strong> ${daysLeft}</p>
            <div style="margin-top: 20px;">
                <a href="${calendarUrl}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Add to Calendar</a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">Sent via IDET Document Manager</p>
        </div>
    `;

    try {
        // 20-second timeout to prevent hanging on slow SMTP connections
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: toEmail, subject, html, text: `Alert: ${docName} expires in ${daysLeft} days!` }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        if (!response.ok) return { success: false, ...data };
        return { success: true, ...data };
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('[Email] Request timed out after 20s');
            return { success: false, error: 'Email request timed out (server may be slow)' };
        }
        return { success: false, error: 'Network Error', details: error.message };
    }
};

export const testBackendConnectivity = async (email: string) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch('/api/test-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        return { success: response.ok, ...data };
    } catch (error: any) {
        if (error.name === 'AbortError') {
            return { success: false, error: 'Email test timed out (server may be slow)' };
        }
        return { success: false, error: error.message };
    }
};