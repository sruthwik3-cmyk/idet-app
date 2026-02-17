// SMS Alert Service using Twilio
// Sends SMS notifications to user's phone number

export interface SMSAlert {
    to: string; // Phone number
    documentName: string;
    daysLeft: number;
    category: string;
    priority: string;
}

// Send SMS alert via backend
export async function sendSMSAlert(alert: SMSAlert): Promise<boolean> {
    try {
        const response = await fetch('/api/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(alert)
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('[SMS] Alert sent successfully:', data);
            return true;
        } else {
            console.error('[SMS] Failed to send alert:', data.error);
            return false;
        }
    } catch (error) {
        console.error('[SMS] Error sending alert:', error);
        return false;
    }
}

// Format SMS message for 30-day alert
export function format30DaySMSMessage(documentName: string, expiryDate: string, category: string): string {
    return `🔔 IDET Reminder: Your ${documentName} (${category}) expires on ${expiryDate}. This is your 30-day advance notice. Please plan for renewal. - IDET Document Tracker`;
}

// Format SMS message for 7-day alert
export function format7DaySMSMessage(documentName: string, expiryDate: string, category: string): string {
    return `🚨 URGENT: Your ${documentName} (${category}) expires in 7 days on ${expiryDate}! Please renew immediately. - IDET Document Tracker`;
}

// Test SMS service
export async function testSMSService(phoneNumber: string): Promise<boolean> {
    try {
        const response = await fetch('/api/test-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber })
        });

        const data = await response.json();
        return response.ok && data.success;
    } catch (error) {
        console.error('[SMS] Test failed:', error);
        return false;
    }
}

// Validate phone number format
export function validatePhoneNumber(phone: string): {
    valid: boolean;
    formatted: string;
    error?: string;
} {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it's a valid length (10 digits for most countries, or with country code)
    if (cleaned.length === 10) {
        // Assume Indian number, add +91
        return {
            valid: true,
            formatted: `+91${cleaned}`
        };
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        // Already has country code
        return {
            valid: true,
            formatted: `+${cleaned}`
        };
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        // US number
        return {
            valid: true,
            formatted: `+${cleaned}`
        };
    } else if (cleaned.length >= 10 && cleaned.length <= 15) {
        // International number with country code
        return {
            valid: true,
            formatted: `+${cleaned}`
        };
    } else {
        return {
            valid: false,
            formatted: phone,
            error: 'Invalid phone number. Please enter a valid 10-digit number.'
        };
    }
}

// Check if SMS alerts are enabled for user
export function isSMSEnabled(userProfile: any): boolean {
    return !!(userProfile?.phone && userProfile.phone.length >= 10);
}

// Get SMS alert status
export async function getSMSStatus(): Promise<{
    configured: boolean;
    available: boolean;
    error?: string;
}> {
    try {
        const response = await fetch('/api/sms-status');
        const data = await response.json();
        
        return {
            configured: data.configured || false,
            available: data.available || false,
            error: data.error
        };
    } catch (error) {
        return {
            configured: false,
            available: false,
            error: 'Failed to check SMS status'
        };
    }
}
