import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
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
 * Creates a Gmail API client.
 * Uses HTTP (REST) instead of SMTP to bypass Render port blocking.
 */
const getGmailClient = async () => {
    // IMPORTANT: .trim() to prevent invisible spaces from Render UI
    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
    const refreshToken = (process.env.GMAIL_REFRESH_TOKEN || '').trim();

    console.log('[Gmail API] Diagnostic Credential Mesh:', {
        userLen: gmailUser.length,
        idLen: clientId.length,
        secretLen: clientSecret.length,
        tokenLen: refreshToken.length,
        idPrefix: clientId.substring(0, 10) + '...',
        secretPrefix: clientSecret.substring(0, 7) + '...'
    });

    if (!gmailUser || !clientId || !clientSecret || !refreshToken) {
        console.error('[Gmail API] Missing/Empty credentials:', {
            hasUser: !!gmailUser,
            hasClientId: !!clientId,
            hasSecret: !!clientSecret,
            hasToken: !!refreshToken
        });
        throw new Error('Missing Google API credentials.');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    return {
        gmail: google.gmail({ version: 'v1', auth: oauth2Client }),
        oauth2Client,
        user: gmailUser
    };
};

/**
 * Creates a raw RFC822 message for Gmail API.
 */
const createRawMessage = (from, to, subject, body) => {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@idet-app.render.com>`;
    const date = new Date().toUTCString();

    const message = [
        `From: "IDET Alerts" <${from}>`,
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        `Date: ${date}`,
        `Message-ID: ${messageId}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        `Content-Transfer-Encoding: 7bit`,
        '',
        body
    ].join('\r\n');

    return Buffer.from(message)
        .toString('base64url'); // Base64url is required by Gmail API
};

// API Endpoint for sending emails using Gmail API (REST)
app.post('/api/send-email', async (req, res) => {
    const timestamp = new Date().toISOString();
    const { to, subject, html, text } = req.body;

    console.log(`[${timestamp}] [Gmail API] ATTEMPT to: ${to}`);

    if (!to) return res.status(400).json({ success: false, error: "Recipient missing" });

    try {
        const { gmail, user } = await getGmailClient();
        const raw = createRawMessage(user, to, subject, html || text);

        console.log(`[Gmail API] Sending message via Google REST API...`);

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw }
        });

        console.log(`[${timestamp}] [Gmail API] SUCCESS! ID: ${response.data.id}`);
        res.json({ success: true, messageId: response.data.id });
    } catch (error) {
        console.error(`[${timestamp}] [Gmail API] ERROR:`, error.message);
        console.error(`[DEBUG] Error Details:`, JSON.stringify(error.errors || error.response?.data || error));

        res.status(500).json({
            success: false,
            error: error.message,
            hint: error.message === 'invalid_client' ? 'Check Client ID/Secret for extra spaces or typos.' : 'Check Refresh Token.'
        });
    }
});

// App health/status endpoint
app.get('/api/health', async (req, res) => {
    let gmailStatus = 'checking';
    let diagnostics = null;

    // IMPORTANT: .trim() to prevent invisible spaces from Render UI
    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
    const refreshToken = (process.env.GMAIL_REFRESH_TOKEN || '').trim();

    const credentials = {
        hasUser: !!gmailUser,
        hasClientId: !!clientId,
        hasSecret: !!clientSecret,
        hasToken: !!refreshToken
    };

    try {
        const { gmail, oauth2Client } = await getGmailClient();
        // Force token refresh to verify everything is 100% correct
        const { token } = await oauth2Client.getAccessToken();
        const profile = await gmail.users.getProfile({ userId: 'me' });
        gmailStatus = `connected as ${profile.data.emailAddress}`;
    } catch (err) {
        gmailStatus = `error: ${err.message}`;
        diagnostics = {
            idLen: clientId.length,
            secretLen: clientSecret.length,
            idPrefix: clientId.substring(0, 10),
            secretPrefix: clientSecret.substring(0, 7)
        };
        console.error('[Health Check] Verification Failure:', err);
    }

    res.json({
        status: 'ok',
        gmailStatus,
        diagnostics,
        credentials,
        mode: 'gmail-api-rest',
        timestamp: new Date().toISOString()
    });
});

// SPA routing catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in GMAIL-API mode`);
});