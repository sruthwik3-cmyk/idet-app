import { generateCalendarUrl } from './calendarUtils';

export const sendExpiryAlert = async (toEmail: string, docName: string, daysLeft: number, expiryDateStr: string, priority: string = 'Important') => {
    const subject = daysLeft <= 7 ? `🚨 URGENT: ${docName} expires in ${daysLeft} days!` : `Reminder: ${docName} Alert (${daysLeft}d)`;
    const calendarUrl = generateCalendarUrl(docName, expiryDateStr, priority);

    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #4f46e5;">Document Expiry Alert</h2>
            <p>The document <strong>${docName}</strong> is expiring soon.</p>
            <p><strong>Days Remaining:</strong> ${daysLeft}</p>
            <div style="margin: 20px 0;">
                <a href="${calendarUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">📅 Add to Calendar</a>
            </div>
            <p style="color: #666; font-size: 12px;">Sent via IDET Document Manager</p>
        </div>
    `;

    try {
        const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: toEmail, subject, html }),
        });
        return await res.json();
    } catch (err) {
        console.error("Email send failed:", err);
        return { success: false, error: "Network error" };
    }
};

export const testBackendConnectivity = async (email: string) => {
    try {
        const res = await fetch('/api/test-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return await res.json();
    } catch (err) {
        return { success: false, error: "No connection to server" };
    }
};
