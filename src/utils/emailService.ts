// Email Service - Correct Implementation for Direct Gmail via Backend API
import { generateCalendarUrl } from './calendarUtils';

export const initEmailService = () => { console.log("Email Service Initialized"); };

export const sendExpiryAlert = async (toEmail: string, docName: string, daysLeft: number, expiryDateStr: string, priority: string = 'Important') => {
    const subject = daysLeft <= 7 ? `🚨 URGENT: ${docName} expires in ${daysLeft} days!` : `Reminder: ${docName} Expiry Alert (${daysLeft}d)`;
    const calendarUrl = generateCalendarUrl(docName, expiryDateStr, priority);
    const htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Document Expiry Alert</h2>
            <p>Your document <strong>${docName}</strong> expires on <strong>${new Date(expiryDateStr).toLocaleDateString()}</strong>.</p>
            <p><strong>Days Left:</strong> ${daysLeft}</p>
            <div style="margin-top: 20px;">
                <a href="${calendarUrl}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Add to Calendar</a>
            </div>
        </div>
    `;

    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: toEmail, subject, html: htmlBody, text: `Alert: ${docName} expires soon!` }),
        });
        const data = await response.json();
        if (!response.ok) return { success: false, ...data };
        return { success: true, response: data };
    } catch (error: any) {
        return { success: false, error: "Network Error", details: error.message };
    }
};

export const testBackendConnectivity = async (email: string) => {
    try {
        const response = await fetch('/api/test-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        return { success: response.ok, ...data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
