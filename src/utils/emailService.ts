import { generateCalendarUrl } from './calendarUtils';
import emailjs from '@emailjs/browser';

// ─── Helper Utilities ────────────────────────────────────────────────────────

/** Simple sleep/delay helper */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Safely parse a fetch response as JSON.
 * Returns { _htmlError: true } if the response is HTML (e.g. Render spin-up page)
 * instead of throwing and crashing the app.
 */
const parseJsonSafe = async (response: Response): Promise<any> => {
    const contentType = response.headers.get('content-type') || '';
    
    // Check if it's JSON first
    if (!contentType.includes('application/json')) {
        // Safe to read text since we haven't consumed the stream yet
        const text = await response.text();
        console.warn('[Email] Non-JSON response received:', text.substring(0, 200));
        return { 
            _htmlError: true, 
            rawText: text.substring(0, 200),
            status: response.status 
        };
    }

    try {
        // Clone the response so we can read it as text if JSON parsing fails
        const clonedResponse = response.clone();
        try {
            return await response.json();
        } catch (jsonErr) {
            const text = await clonedResponse.text();
            console.warn('[Email] JSON parse failed, falling back to text:', text.substring(0, 200));
            return { 
                _htmlError: true, 
                rawText: text.substring(0, 200),
                status: response.status,
                parseError: true
            };
        }
    } catch (err: any) {
        console.error('[Email] Critical error in parseJsonSafe:', err);
        return { _htmlError: true, error: err.message };
    }
};

/**
 * Ping the health endpoint to wake up the Render free-tier server before
 * making the real email request. Free instances sleep after ~15 min inactivity
 * and return an HTML placeholder page for the first request during spin-up.
 */
const wakeUpServer = async (): Promise<void> => {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 55000); // 55s max spin-up time
        const res = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(id);
        const data = await parseJsonSafe(res);
        if (data._htmlError) {
            // Server still starting — wait extra time
            console.warn('[Email] Server still waking up, waiting 10s...');
            await delay(10000);
        } else {
            console.log('[Email] Server is awake. Gmail status:', data.gmailStatus);
        }
    } catch (e) {
        console.warn('[Email] Wake-up ping failed (server might still be starting):', e);
        await delay(5000);
    }
};


/**
 * Sends an email using EmailJS directly from the client.
 */
export const sendViaEmailJS = async (toEmail: string, docName: string, daysLeft: number, expiryDateStr: string, priority: string) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey || 
        serviceId === 'YOUR_SERVICE_ID' || templateId === 'YOUR_TEMPLATE_ID' || publicKey === 'YOUR_PUBLIC_KEY' ||
        !serviceId.trim() || !templateId.trim() || !publicKey.trim()) {
        console.log('[EmailJS] Credentials not configured or using placeholders. Skipping.');
        return { success: false, error: 'EmailJS not configured' };
    }

    const calendarUrl = generateCalendarUrl(docName, expiryDateStr, priority);
    const formattedDate = new Date(expiryDateStr).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const isUrgent = daysLeft <= 7;
    const subject = isUrgent 
        ? `🚨 URGENT: ${docName} expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` 
        : `📋 Reminder: ${docName} expires in ${daysLeft} days`;

    const templateParams = {
        to_email: toEmail,
        doc_name: docName,
        days_left: daysLeft,
        expiry_date: formattedDate,
        priority: priority,
        calendar_url: calendarUrl,
        subject: subject
    };

    try {
        console.log('[EmailJS] Attempting direct browser email send...');
        const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
        console.log('[EmailJS] SUCCESS!', response.status, response.text);
        return { success: true, messageId: response.text };
    } catch (err: any) {
        console.error('[EmailJS] FAILED:', err);
        return { success: false, error: err.text || err.message || 'EmailJS sending failed' };
    }
};


/**
 * Sends an email alert via the backend API.
 * The backend now uses Gmail API (REST) to bypass Render port blocks.
 */
export const sendExpiryAlert = async (toEmail: string, docName: string, daysLeft: number, expiryDateStr: string, priority: string = 'Important') => {
    // Step 0: Try to send via EmailJS first if configured
    const emailJsResult = await sendViaEmailJS(toEmail, docName, daysLeft, expiryDateStr, priority);
    if (emailJsResult.success) {
        return emailJsResult;
    } else if (emailJsResult.error !== 'EmailJS not configured') {
        console.warn('[Email] EmailJS failed, falling back to Gmail API backend. Error:', emailJsResult.error);
    }

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
        console.log(`[Email] Waking up backend server...`);
        // Step 1: Wake up the Render server (free tier sleeps after inactivity)
        // This prevents the HTML "spinning up" page from being returned for the email request
        await wakeUpServer();

        console.log(`[Email] Sending request to backend for: ${docName}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: toEmail, subject, html, text }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Step 2: Validate response is JSON before parsing
        // If Render is still waking up, it may return HTML instead of JSON
        const safeData = await parseJsonSafe(response);
        console.log(`[Email] Backend response for "${docName}":`, safeData);

        if (safeData._htmlError) {
            console.error(`[Email] Server returned HTML (still waking up?) for "${docName}"`);
            // Step 3: Retry once after a short delay
            console.log(`[Email] Retrying after 5 seconds...`);
            await delay(5000);
            const retryResponse = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: toEmail, subject, html, text }),
            });
            const retryData = await parseJsonSafe(retryResponse);
            if (retryData._htmlError) {
                return { success: false, error: 'Server is still starting up. Please try again in 30 seconds.' };
            }
            if (!retryResponse.ok) {
                return { success: false, error: retryData.error || retryData.hint || 'Email send failed on retry' };
            }
            return { success: true, ...retryData };
        }

        if (!response.ok) {
            console.error(`[Email] Backend FAILED for "${docName}":`, safeData.error || 'Unknown error');
            // Provide a user-friendly message for expired token
            const errorMsg = safeData.error || '';
            if (errorMsg.includes('invalid_grant') || errorMsg.includes('Token has been expired')) {
                return { success: false, error: 'Gmail token expired. Admin needs to update the refresh token on Render.' };
            }
            return { success: false, error: safeData.error || safeData.hint || 'Backend Error' };
        }
        return { success: true, ...safeData };
    } catch (error: any) {
        console.error(`[Email] Fetch error for "${docName}":`, error);
        if (error.name === 'AbortError') {
            return { success: false, error: 'Email request timed out. The server may be starting up — please try again in 30 seconds.' };
        }
        return { success: false, error: error.message || 'Network error (Check Render Logs)' };
    }
};

/**
 * Backend connectivity test for Gmail API.
 */
export const testBackendConnectivity = async (email: string) => {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: email,
                subject: 'IDET Connectivity Test',
                text: 'Connection Successful!'
            }),
        });
        return await parseJsonSafe(response);
    } catch (err: any) {
        return { success: false, error: err.message || 'Network error' };
    }
};