// Email Service - Direct Gmail via Netlify Functions

export const initEmailService = () => {
    // No frontend init required for backend functions
    console.log("Email Service Initialized (Backend Mode)");
};

export const sendExpiryAlert = async (toEmail: string, docName: string, daysLeft: number, expiryDateStr: string, priority: string = 'Important') => {
    const isCritical = priority === 'Critical';
    const subject = isCritical ? `🚨 [URGENT] ${docName} is expiring!` : `Reminder: ${docName} Expiry Alert`;

    // Generate Google Calendar Link
    // Format dates as YYYYMMDDT000000Z
    const startDate = new Date(expiryDateStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(new Date(expiryDateStr).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Expiry: ${docName}`)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`Document Category: ${priority} Priority\n\nThis document expires today. Please verify renewal status.`)}&sf=true&output=xml`;

    // HTML Body - Professional Slate/Indigo Theme
    const htmlBody = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">
                        Document Expiry Notification
                    </h1>
                </div>
                
                <div style="padding: 40px 30px;">
                    <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-top: 0;">
                        Hello,
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        This is an official notification regarding the upcoming expiration of your document: <strong style="color: #1e293b;">${docName}</strong>.
                    </p>
                    
                    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin: 32px 0; border-left: 4px solid ${isCritical ? '#ef4444' : '#6366f1'};">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 8px;">Status</td>
                            </tr>
                            <tr>
                                <td style="color: #1e293b; font-size: 18px; font-weight: 600;">
                                    Expiring in ${daysLeft} days
                                </td>
                            </tr>
                            <tr>
                                <td style="color: #64748b; font-size: 14px; padding-top: 16px;">Expiration Date: ${new Date(expiryDateStr).toLocaleDateString(undefined, { dateStyle: 'long' })}</td>
                            </tr>
                        </table>
                    </div>

                    ${isCritical ? `
                    <p style="color: #b91c1c; font-size: 14px; font-weight: 600; display: flex; alignItems: center; gap: 8px;">
                        ⚠️ ACTION REQUIRED: Immediate renewal is recommended to ensure continuity.
                    </p>` : ''}

                    <div style="text-align: center; margin: 40px 0 20px;">
                        <a href="${calendarUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                            📅 Add to Calendar
                        </a>
                    </div>
                </div>

                <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        Sent automatically by IDET Document Manager
                    </p>
                </div>
            </div>
        </div>
    `;

    const textBody = `
DOCUMENT EXPIRY NOTIFICATION

Your document "${docName}" is scheduled to expire in ${daysLeft} days (${new Date(expiryDateStr).toLocaleDateString()}).

Priority: ${priority}
Action: Please review and initiate renewal if necessary.

Add to Calendar: ${calendarUrl}

Sent from IDET Document Manager
    `;

    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: toEmail, subject, html: htmlBody, text: textBody }),
        });
        const data = await response.json();
        return { success: response.ok, response: data };
    } catch (error) {
        console.error("[EmailService] Error:", error);
        return { success: false, error };
    }
};

export const sendConfirmationEmail = async (toEmail: string, docName: string, category: string, expiryDate: string) => {
    const subject = `✅ Document Secured: ${docName} is now in your Vault`;

    // Generate dates for Calendar
    const startDate = new Date(expiryDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(new Date(expiryDate).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Expiry: ${docName}`)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`Category: ${category}\n\nThis is a confirmation that your document has been secured in your IDET Vault.`)}&sf=true&output=xml`;

    const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background-color: #4f46e5; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">All Systems Go! 🚀</h1>
                <p style="margin: 8px 0 0; opacity: 0.9;">Gmail, Sound, and Calendar Alerts are Synchronized</p>
            </div>
            <div style="padding: 30px;">
                <p style="font-size: 16px; color: #1e293b;">Hello,</p>
                <p style="font-size: 16px; color: #475569;">Your document <strong style="color: #1e293b;">${docName}</strong> is now securely tracked in your vault.</p>
                
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
                    <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Details</p>
                    <p style="margin: 8px 0 4px; font-size: 18px; color: #1e293b; font-weight: 600;">${category}</p>
                    <p style="margin: 0; font-size: 14px; color: #475569;">Expires on: ${new Date(expiryDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>

                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 12px; border: 1px dashed #6366f1; border-radius: 8px; background: rgba(99, 102, 241, 0.02);">
                    <div style="font-size: 24px;">🚨</div>
                    <div>
                        <p style="margin: 0; font-weight: 600; color: #4338ca;">Multi-Channel Alerts Active</p>
                        <p style="margin: 0; font-size: 13px; color: #6366f1;">Gmail, sound, and notifications will trigger on schedule.</p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 32px;">
                    <a href="${calendarUrl}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                        📅 Add to Google Calendar
                    </a>
                </div>
            </div>
            <div style="padding: 20px; text-align: center; background: #f8fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">Sent automatically by IDET Document Manager</p>
            </div>
        </div>
    `;

    try {
        await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: toEmail, subject, html: htmlBody, text: `Success! ${docName} is secured in your vault.` }),
        });
        return { success: true };
    } catch (e) {
        console.error("Confirmation email failed:", e);
        return { success: false };
    }
};
