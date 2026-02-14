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
 * Prioritizes OAuth2 but falls back to App Password.
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

    // A: Attempt OAuth2
    if (clientId && clientSecret && refreshToken) {
        console.log('[Email Service] Using OAuth2 authentication...');
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        try {
            const { token } = await oauth2Client.getAccessToken();
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
            console.error('[Email Service] OAuth2 Error, looking for fallback:', err.message);
        }
    }

    // B: Fallback to App Password
    if (appPassword) {
        console.log('[Email Service] Using App Password authentication.');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: appPassword
            }
        });
    }

    throw new Error('Missing GMAIL_USER and either GMAIL_APP_PASSWORD or OAuth2 credentials.');
};

// API Endpoint for sending emails
app.post('/api/send-email', async (req, res) => {
    const timestamp = new Date().toISOString();
    const { to, subject, html, text } = req.body;

    console.log(`[${timestamp}] [Email] Send request to: ${to}`);

    if (!to || !subject || (!html && !text)) {
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

        console.log(`[${timestamp}] [Email] Success! ID: ${info.messageId}`);
        return res.status(200).json({ message: "Email sent successfully", messageId: info.messageId });

    } catch (error) {
        console.error(`[${timestamp}] [Email] Error:`, error.message);
        return res.status(500).json({
            error: "Failed to send email",
            details: error.message,
            reason: error.message.includes('Missing GMAIL_USER') ? 'Credentials Missing' : 'SMTP Error'
        });
    }
});

// App health/status endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        emailService: !!(process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_REFRESH_TOKEN) ? 'configured' : 'missing',
        timestamp: new Date().toISOString()
    });
});

// Direct test endpoint
app.post('/api/test-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    try {
        const transporter = await createTransporter();
        await transporter.verify();
        const info = await transporter.sendMail({
            from: `"IDET Alerts" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'IDET Connectivity Test',
            text: 'Your email alert system is connected!'
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// SPA routing catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
