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
    const gmailUser = process.env.GMAIL_USER;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!gmailUser || !clientId || !clientSecret || !refreshToken) {
        console.error('[Gmail API] Missing credentials in environment:', {
            hasUser: !!gmailUser,
            hasClientId: !!clientId,
            hasSecret: !!clientSecret,
            hasToken: !!refreshToken
        });
        throw new Error('Missing Google API credentials.');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * Creates a raw RFC822 message for Gmail API.
 * Uses base64url encoding.
 */
const createRawMessage = (to, subject, html, text) => {
    const from = process.env.GMAIL_USER;
    const body = html || text;

    // RFC 822 format requires specific headers and boundaries for complex emails, 
    // but for simple HTML/Text, this format works well.
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

    // Use \r\n as per RFC 822
    const messageParts = [
        `From: "IDET Alerts" <${from}>`,
        `To: ${to}`,
        `Content-Type: text/html; charset=utf-8`,
        `MIME-Version: 1.0`,
        `Subject: ${utf8Subject}`,
        '',
        body
    ];
    const message = messageParts.join('\r\n');

    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

// API Endpoint for sending emails using Gmail API (REST)
app.post('/api/send-email', async (req, res) => {
    const timestamp = new Date().toISOString();
    const { to, subject, html, text } = req.body;

    console.log(`[${timestamp}] [Gmail API] Send Request to: ${to}`);

    try {
        const gmail = await getGmailClient();
        const raw = createRawMessage(to, subject, html, text);

        // Verification log (safe version)
        console.log(`[Gmail API] Preparing to send via: ${process.env.GMAIL_USER}`);

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw }
        });

        console.log(`[${timestamp}] [Gmail API] SEND SUCCESS! ID: ${response.data.id}`);
        res.json({ success: true, messageId: response.data.id });
    } catch (error) {
        console.error(`[${timestamp}] [Gmail API] SEND FAILURE:`, error.message);
        // Provide more detail if it's an auth error
        const isAuthError = error.message.includes('401') || error.message.includes('invalid_grant');
        res.status(500).json({
            success: false,
            error: error.message,
            hint: isAuthError ? "Check if GMAIL_REFRESH_TOKEN is correct and not expired." : "Check logs for details."
        });
    }
});

// App health/status endpoint
app.get('/api/health', async (req, res) => {
    let gmailStatus = 'checking';
    try {
        const gmail = await getGmailClient();
        const profile = await gmail.users.getProfile({ userId: 'me' });
        gmailStatus = `connected as ${profile.data.emailAddress}`;
    } catch (err) {
        gmailStatus = `error: ${err.message}`;
    }

    res.json({
        status: 'ok',
        gmailStatus,
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