// SMS Service Backend using Twilio
// Add this to your server.js or create a separate SMS service

import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;

// Initialize Twilio client
function initializeTwilio() {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        console.warn('[SMS] Twilio credentials not configured');
        return false;
    }

    try {
        twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        console.log('[SMS] Twilio client initialized');
        return true;
    } catch (error) {
        console.error('[SMS] Failed to initialize Twilio:', error);
        return false;
    }
}

// Send SMS
export async function sendSMS(to, message) {
    if (!twilioClient) {
        const initialized = initializeTwilio();
        if (!initialized) {
            return { success: false, error: 'SMS service not configured' };
        }
    }

    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: to
        });

        console.log('[SMS] Message sent:', result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('[SMS] Failed to send message:', error);
        return { success: false, error: error.message };
    }
}

// Send 30-day alert SMS
export async function send30DaySMS(phoneNumber, documentName, expiryDate, category) {
    const message = `🔔 IDET Reminder: Your ${documentName} (${category}) expires on ${expiryDate}. This is your 30-day advance notice. Please plan for renewal. - IDET Document Tracker`;
    return await sendSMS(phoneNumber, message);
}

// Send 7-day alert SMS
export async function send7DaySMS(phoneNumber, documentName, expiryDate, category) {
    const message = `🚨 URGENT: Your ${documentName} (${category}) expires in 7 days on ${expiryDate}! Please renew immediately. - IDET Document Tracker`;
    return await sendSMS(phoneNumber, message);
}

// Test SMS service
export async function testSMS(phoneNumber) {
    const message = `✅ IDET Test: SMS alerts are working! You will receive notifications about expiring documents on this number. - IDET Document Tracker`;
    return await sendSMS(phoneNumber, message);
}

// Check SMS service status
export function getSMSServiceStatus() {
    const configured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
    const available = !!twilioClient;

    return {
        configured,
        available,
        error: !configured ? 'Twilio credentials not configured' : null
    };
}

// Express route handlers (add these to your server.js)
export const smsRoutes = {
    // POST /api/send-sms
    sendSMS: async (req, res) => {
        const { to, documentName, daysLeft, category, priority } = req.body;

        if (!to || !documentName) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysLeft);
        const formattedDate = expiryDate.toLocaleDateString('en-GB');

        let result;
        if (daysLeft <= 7) {
            result = await send7DaySMS(to, documentName, formattedDate, category);
        } else {
            result = await send30DaySMS(to, documentName, formattedDate, category);
        }

        res.json(result);
    },

    // POST /api/test-sms
    testSMS: async (req, res) => {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, error: 'Phone number required' });
        }

        const result = await testSMS(phoneNumber);
        res.json(result);
    },

    // GET /api/sms-status
    getSMSStatus: (req, res) => {
        const status = getSMSServiceStatus();
        res.json(status);
    }
};

// Initialize on module load
initializeTwilio();
