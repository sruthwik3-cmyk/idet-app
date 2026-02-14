import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

/**
 * Creates a Nodemailer transporter based on available environment variables.
 * Prioritizes OAuth2 (Production) but falls back to App Password (Local).
 */
const createTransporter = async () => {
    const gmailUser = process.env.GMAIL_USER;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const appPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser) {
        console.error('[Email Service] Error: GMAIL_USER environment variable is missing.');
    }

    // Step A: Attempt OAuth2 (Prioritized for Render)
    if (clientId && clientSecret && refreshToken) {
        console.log('[Email Service] Attempting OAuth2/Gmail API authentication...');
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        try {
            const { token } = await oauth2Client.getAccessToken();
            console.log('[Email Service] OAuth2 Access Token retrieved.');
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: gmailUser,
                    clientId,
                    clientSecret,
                    refreshToken,
                    accessToken: token
                }
            });
        } catch (err) {
            console.error('[Email Service] OAuth2 Token Error:', err.message);
            console.log('[Email Service] Falling back to App Password check...');
        }
    }

    // Step B: Fallback to App Password (Common for Local Dev)
    if (appPassword) {
        console.log('[Email Service] Using Gmail App Password authentication.');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: appPassword
            }
        });
    }

    throw new Error('No valid email credentials found. Please set GMAIL_USER and either GMAIL_APP_PASSWORD or OAuth2 variables.');
};

// API Endpoint for sending emails
app.post('/api/send-email', async (req, res) => {
    const timestamp = new Date().toISOString();
    const { to, subject, html, text } = req.body;

    console.log(`[${timestamp}] [Email] Received request to: ${to}, Subject: ${subject}`);

    if (!to || !subject || (!html && !text)) {
        console.error(`[${timestamp}] [Email] Missing required fields for: ${to}`);
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail({
            from: `"IDET Alerts" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
            text
        });

        console.log(`[${timestamp}] [Email] Success! To: ${to}, ID: ${info.messageId}`);
        return res.status(200).json({ message: "Email sent successfully", messageId: info.messageId });

    } catch (error) {
        console.error(`[${timestamp}] [Email] CRITICAL ERROR:`, error.message);
        return res.status(500).json({
            error: "Failed to send email",
            details: error.message,
            reason: error.message.includes('No valid email credentials') ? 'Credentials Missing' : 'SMTP Error'
        });
    }
});

// Connectivity test endpoint
app.post('/api/test-email', async (req, res) => {
    const timestamp = new Date().toISOString();
    const { email } = req.body;

    console.log(`[${timestamp}] [Email] Test Request for: ${email}`);

    if (!email) return res.status(400).json({ error: "Email required" });

    try {
        const transporter = await createTransporter();
        await transporter.verify();
        const info = await transporter.sendMail({
            from: `"IDET Alerts" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'IDET Email Connectivity Test',
            text: 'Your IDET Gmail alert system is now correctly configured and connected!'
        });
        console.log(`[${timestamp}] [Email] Test Success for: ${email}`);
        res.json({ success: true, messageId: info.messageId });
    } catch (err) {
        console.error(`[${timestamp}] [Email] Test Failure:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/health', (req, res) => {
    const emailConfigured = !!(
        (process.env.GOOGLE_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) ||
        process.env.GMAIL_APP_PASSWORD
    );
    res.json({
        status: 'ok',
        emailService: emailConfigured ? 'configured' : 'missing_credentials',
        timestamp: new Date().toISOString()
    });
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
