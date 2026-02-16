import { generateCalendarUrl } from './calendarUtils';

/**
 * Sends an email alert via the backend API.
 * The backend now uses Gmail API (REST) to bypass Render port blocks.
 */
export const sendExpiryAlert = async (toEmail: string, docName: string, daysLeft: number, expiryDateStr: string, priority: string = 'Important') => {
    const isUrgent = daysLeft <= 7;
    const subject = isUrgent 
        ? `🚨 URGENT: ${docName} expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` 
        : `📋 Reminder: ${docName} expires in ${daysLeft} days`;
    
    const calendarUrl = generateCalendarUrl(docName, expiryDateStr, priority);
    const formattedDate = new Date(expiryDateStr).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const urgencyColor = isUrgent ? '#ef4444' : '#f59e0b';
    const urgencyBg = isUrgent ? '#fef2f2' : '#fffbeb';
    const urgencyText = isUrgent ? 'URGENT ACTION REQUIRED' : 'UPCOMING EXPIRY';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">IDET Document Manager</h1>
                                    <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 14px;">Intelligent Document Expiry Tracking</p>
                                </td>
                            </tr>
                            
                            <!-- Alert Badge -->
                            <tr>
                                <td style="padding: 30px 40px 20px;">
                                    <div style="background-color: ${urgencyBg}; border-left: 4px solid ${urgencyColor}; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                                        <p style="margin: 0; color: ${urgencyColor}; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            ${urgencyText}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 0 40px 30px;">
                                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 22px; font-weight: 600;">Document Expiry Notification</h2>
                                    
                                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                        This is a ${isUrgent ? 'critical' : 'friendly'} reminder that your document is ${isUrgent ? 'expiring soon' : 'approaching its expiry date'}.
                                    </p>
                                    
                                    <!-- Document Details Card -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px;">
                                        <tr>
                                            <td style="padding: 24px;">
                                                <table width="100%" cellpadding="8" cellspacing="0">
                                                    <tr>
                                                        <td style="color: #6b7280; font-size: 14px; font-weight: 600; padding-bottom: 12px;">Document Name:</td>
                                                        <td style="color: #1f2937; font-size: 16px; font-weight: 700; text-align: right; padding-bottom: 12px;">${docName}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #6b7280; font-size: 14px; font-weight: 600; padding-bottom: 12px;">Expiry Date:</td>
                                                        <td style="color: #1f2937; font-size: 14px; text-align: right; padding-bottom: 12px;">${formattedDate}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #6b7280; font-size: 14px; font-weight: 600; padding-bottom: 12px;">Priority Level:</td>
                                                        <td style="text-align: right; padding-bottom: 12px;">
                                                            <span style="background-color: ${priority === 'Critical' ? '#fef2f2' : priority === 'Important' ? '#fffbeb' : '#f0fdf4'}; color: ${priority === 'Critical' ? '#dc2626' : priority === 'Important' ? '#d97706' : '#16a34a'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                                                ${priority}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color: #6b7280; font-size: 14px; font-weight: 600; border-top: 1px solid #e5e7eb; padding-top: 16px;">Days Remaining:</td>
                                                        <td style="text-align: right; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                                                            <span style="color: ${urgencyColor}; font-size: 32px; font-weight: 700; line-height: 1;">
                                                                ${daysLeft}
                                                            </span>
                                                            <span style="color: #6b7280; font-size: 14px; margin-left: 4px;">
                                                                ${daysLeft === 1 ? 'day' : 'days'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Action Required -->
                                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                                        <p style="margin: 0 0 4px; color: #1e40af; font-weight: 600; font-size: 14px;">📌 Action Required:</p>
                                        <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.5;">
                                            Please take necessary steps to renew or update this document before it expires. ${isUrgent ? 'Immediate attention is recommended.' : 'Plan ahead to avoid any disruptions.'}
                                        </p>
                                    </div>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 8px 0 24px;">
                                                <a href="${calendarUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);">
                                                    📅 Add to Google Calendar
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                                        <strong>Tip:</strong> Adding this to your calendar ensures you'll receive additional reminders from Google Calendar as the date approaches.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; line-height: 1.5;">
                                        This is an automated notification from <strong>IDET Document Manager</strong>. You're receiving this because you have an active document expiring soon.
                                    </p>
                                    <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                                        Sent via Gmail API • Secure & Reliable Document Tracking
                                    </p>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Bottom Spacing -->
                        <table width="600" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding: 20px; text-align: center;">
                                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                        © ${new Date().getFullYear()} IDET Document Manager. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    const text = `
IDET DOCUMENT MANAGER - ${urgencyText}

Document Expiry Notification

Your document is ${isUrgent ? 'expiring soon' : 'approaching its expiry date'}.

DOCUMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document Name: ${docName}
Expiry Date: ${formattedDate}
Priority Level: ${priority}
Days Remaining: ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTION REQUIRED:
Please take necessary steps to renew or update this document before it expires. ${isUrgent ? 'Immediate attention is recommended.' : 'Plan ahead to avoid any disruptions.'}

ADD TO CALENDAR:
${calendarUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated notification from IDET Document Manager.
Sent via Gmail API • Secure & Reliable Document Tracking
© ${new Date().getFullYear()} IDET Document Manager. All rights reserved.
    `.trim();

    try {
        console.log(`[Email] Sending request to backend for: ${docName}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: toEmail, subject, html, text }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        console.log(`[Email] Backend response for "${docName}":`, data);

        if (!response.ok) {
            console.error(`[Email] Backend FAILED for "${docName}":`, data.error || 'Unknown error');
            return { success: false, error: data.error || data.hint || 'Backend Error' };
        }
        return { success: true, ...data };
    } catch (error: any) {
        console.error(`[Email] Fetch error for "${docName}":`, error);
        if (error.name === 'AbortError') {
            return { success: false, error: 'Email request timed out (Backend slow)' };
        }
        return { success: false, error: error.message || 'Network error (Check Render Logs)' };
    }
};

/**
 * Backend connectivity test for Gmail API.
 */
export const testBackendConnectivity = async (email: string) => {
    const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: email,
            subject: 'IDET Connectivity Test',
            text: 'Connection Successful!'
        }),
    });
    return response.json();
};