import emailjs from '@emailjs/browser';
import { generateCalendarUrl } from './calendarUtils';

// Initialize EmailJS with Public Key (User will provide this)
// We'll use a placeholder or env var, but for now hardcode user instructions
const PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY"; // User needs to set this
const SERVICE_ID = "service_gmail";           // Standard service ID for Gmail
const TEMPLATE_ID = "template_idet_alert";    // User needs to create this

export const initEmailJS = (publicKey: string) => {
    emailjs.init(publicKey);
};

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
        // We use the environment variables if available, otherwise fallback to specific instruction strings to debug
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_gmail';
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_idet_alert';
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!publicKey) {
            console.error("EmailJS Public Key missing!");
            return { success: false, error: "Configuration Error: Missing EmailJS Public Key" };
        }

        const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

        if (response.status === 200) {
            return { success: true, messageId: "emailjs_" + Date.now() };
        } else {
            return { success: false, error: "EmailJS Error: " + response.text };
        }
    } catch (error: any) {
        console.error("EmailJS Send Error:", error);
        return { success: false, error: error.message || "Unknown EmailJS Error" };
    }
};

export const testBackendConnectivity = async (email: string) => {
    // This is now a client-side test
    return sendExpiryAlert(email, "TEST DOCUMENT", 30, new Date().toISOString());
};