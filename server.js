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
async function createTransporter() {
    const gmailUser = process.env.GMAIL_USER;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const appPassword = process.env.GMAIL_APP_PASSWORD;

    // Option A: OAuth2 (Ideal for Production/Render)
    if (clientId && clientSecret && refreshToken) {
        console.log('[Email Service] Using OAuth2/Gmail API authentication');
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
            console.error('[Email Service] OAuth2 Token Error:', err.message);
            // If OAuth fails, we check for App Password fallback
        }
    }

    // Option B: App Password (Ideal for Local Dev)
    if (appPassword) {
        console.log('[Email Service] Using Gmail App Password authentication');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: appPassword
            }
        });
    }

    throw new Error('No valid email credentials found (OAuth2 or App Password)');
}

// API Endpoint for sending emails
app.post('/api/send-email', async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Received email request`);
    const { to, subject, html, text } = req.body;

    console.log(`To: ${to}, Subject: ${subject}`);

    if (!to || !subject || (!html && !text)) {
        console.error("Missing required fields");
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject,
            html,
            text
        });

        console.log('[Email Service] Email sent successfully! Message ID:', info.messageId);
        return res.status(200).json({
            message: "Email sent successfully",
            messageId: info.messageId
        });

    } catch (error) {
        console.error("[Email Service] Error:", error.message);
        return res.status(500).json({
            error: "Failed to send email",
            details: error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    const emailConfigured = !!(
        (process.env.GOOGLE_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) ||
        process.env.GMAIL_APP_PASSWORD
    );
    res.json({
        status: 'ok',
        emailService: emailConfigured ? 'configured (Nodemailer)' : 'missing_credentials',
        timestamp: new Date().toISOString()
    });
});

// Catch-all for SPA routing (Use '*' instead of '/*' to avoid PathError in newer Express)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Email service: Nodemailer (SMTP Gateway)`);
});
