// Email Service - Direct Gmail via Netlify Functions

export const initEmailService = () => {
    // No frontend init required for backend functions
    console.log("Email Service Initialized (Backend Mode)");
};

export const sendExpiryAlert = async (toEmail: string, docName: string, daysLeft: number, expiryDateStr: string, priority: string = 'Important') => {
    const isCritical = priority === 'Critical';
    const subject = isCritical ? `🚨 [URGENT] Document Expiry: ${docName}` : `Reminder: ${docName} verification`;

    // Generate Google Calendar Link
    // Format dates as YYYYMMDDT000000Z
    const startDate = new Date(expiryDateStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(new Date(expiryDateStr).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Expiry: ${docName}`)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`Document Category: ${priority} Priority\n\nThis document expires today. Please verify renewal status.`)}&sf=true&output=xml`;

    // HTML Body
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: ${isCritical ? '#ef4444' : '#333'}">${isCritical ? 'URGENT ACTION REQUIRED' : 'Document Expiry Reminder'}</h2>
            <p>Hello,</p>
            <p>This is a notification regarding your document: <strong>${docName}</strong>.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid ${isCritical ? '#ef4444' : '#3b82f6'}">
                <p style="margin: 0; font-size: 1.1em;">
                    <strong>Status:</strong> Expires in <strong>${daysLeft} days</strong> (${new Date(expiryDateStr).toLocaleDateString()}).
                </p>
                ${isCritical ? '<p style="margin-top: 10px; color: #ef4444; font-weight: bold;">Immediate renewal is strongly recommended to avoid penalties.</p>' : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${calendarUrl}" style="background-color: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    📅 Add to Google Calendar
                </a>
            </div>

            <p>Please take necessary action.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 0.8em; color: #666;">Sent from IDET Document Manager</p>
        </div>
    `;

    const textBody = `
${isCritical ? 'URGENT ACTION REQUIRED' : 'Document Expiry Reminder'}

Your document "${docName}" is expiring in ${daysLeft} days.
${isCritical ? 'Immediate renewal is strongly recommended.' : ''}
    `;

    try {
        console.log(`[EmailService] Sending email to ${toEmail}...`);
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: toEmail,
                subject: subject,
                html: htmlBody,
                text: textBody
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("[EmailService] Email sent successfully:", data);
        return { success: true, response: data };

    } catch (error) {
        console.error("[EmailService] Email Send Error:", error);

        const errorDetails = error instanceof Error ? error.message : String(error);

        // Fallback for simulation/dev mode if function is not running locally
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const errorMsg = `Backend Error: ${errorDetails}. Check if 'node server.js' is running.`;
            console.error(`%c[BACKEND ERROR] ${errorMsg}`, 'color: #ef4444; font-weight: bold; font-size: 14px;');

            return { success: false, isSimulation: false, error: { message: errorMsg, details: errorDetails } };
        }

        return { success: false, error: { message: "Failed to connect to email service.", details: errorDetails } };
    }
};
