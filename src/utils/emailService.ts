import emailjs from '@emailjs/browser';
import { generateCalendarUrl } from './calendarUtils';

/**
 * Sends an email alert using EmailJS browser SDK.
 * This bypasses Render's SMTP port restrictions.
 */
export const sendExpiryAlert = async (toEmail: string, docName: string, daysLeft: number, expiryDateStr: string, priority: string = 'Important') => {
    const calendarUrl = generateCalendarUrl(docName, expiryDateStr, priority);
    const formattedDate = new Date(expiryDateStr).toLocaleDateString();

    const templateParams = {
        to_email: toEmail,
        doc_name: docName,
        days_left: daysLeft,
        expiry_date: formattedDate,
        calendar_url: calendarUrl,
        priority: priority
    };

    try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!publicKey || !serviceId || !templateId) {
            console.error("[EmailJS] Missing configuration:", { serviceId, templateId, publicKey });
            return {
                success: false,
                error: "EmailJS not configured correctly. Please check Render Environment Variables."
            };
        }

        const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

        if (response.status === 200) {
            console.log("[EmailJS] Alert sent successfully for:", docName);
            return { success: true, messageId: "emailjs_" + Date.now() };
        } else {
            return { success: false, error: `EmailJS Error: ${response.text}` };
        }
    } catch (error: any) {
        console.error("[EmailJS] Send Error:", error);
        return { success: false, error: error.message || "Unknown EmailJS error" };
    }
};

/**
 * Client-side connectivity test for EmailJS.
 */
export const testBackendConnectivity = async (email: string) => {
    return sendExpiryAlert(email, "TEST_DOCUMENT", 30, new Date().toISOString());
};