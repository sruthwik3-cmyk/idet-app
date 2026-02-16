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

console.log('[Startup] IDET Server initializing...');
console.log('[Startup] Node Version:', process.version);
console.log('[Startup] Port:', PORT);
console.log('[Startup] Environment:', process.env.NODE_ENV || 'development');

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
 * Uses base64 for body to handle UTF-8 symbols safely.
 */
const createRawMessage = (from, to, subject, body) => {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const date = new Date().toUTCString();

    // We treat 'body' as HTML since that's what our frontend sends
    const htmlBody = body;
    const textBody = body.replace(/<[^>]*>?/gm, ''); // Simple strip for plain text fallback

    const message = [
        `From: "IDET Alerts" <${from}>`,
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        `Date: ${date}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        `Content-Type: text/plain; charset=utf-8`,
        `Content-Transfer-Encoding: 7bit`,
        '',
        textBody,
        '',
        `--${boundary}`,
        `Content-Type: text/html; charset=utf-8`,
        `Content-Transfer-Encoding: base64`,
        '',
        Buffer.from(htmlBody).toString('base64'),
        '',
        `--${boundary}--`
    ].join('\r\n');

    return Buffer.from(message).toString('base64url');
};

// API Endpoint for sending emails using Gmail API (REST)
app.post('/api/send-email', async (req, res) => {
    const timestamp = new Date().toISOString();
    const { to, subject, html, text } = req.body;

    console.log(`[${timestamp}] [Gmail API] SEND Attempt to: ${to} (Subject: ${subject})`);
    if (!to) return res.status(400).json({ success: false, error: "Recipient missing" });

    try {
        const { gmail, user } = await getGmailClient();
        const raw = createRawMessage(user, to, subject, html || text);
        const rawLength = raw.length;

        console.log(`[Gmail API] Dispatching message (Length: ${rawLength} bytes)...`);
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw }
        });

        console.log(`[${timestamp}] [Gmail API] SUCCESS! ID: ${response.data.id}`);
        res.json({ success: true, messageId: response.data.id });
    } catch (error) {
        console.error(`[${timestamp}] [Gmail API] SEND FAILURE:`, {
            msg: error.message,
            code: error.code,
            details: error.response?.data
        });

        res.status(500).json({
            success: false,
            error: error.message,
            hint: error.message.includes('invalid_client')
                ? 'Check your Google Client ID and Secret in Render/Supabase.'
                : (error.message.includes('invalid_grant') ? 'Your Refresh Token is invalid or expired. Please re-generate it.' : 'Check your Google Cloud settings.'),
            details: error.response?.data,
            credentialsDiagnostic: {
                hasId: !!process.env.GOOGLE_CLIENT_ID,
                hasSecret: !!process.env.GOOGLE_CLIENT_SECRET,
                hasToken: !!process.env.GMAIL_REFRESH_TOKEN
            }
        });
    }
});

// Diagnostic Route: Verifies token explicitly without sending mail
app.get('/api/diagnose-gmail', async (req, res) => {
    try {
        const { oauth2Client } = await getGmailClient();
        console.log('[Diagnostic] Attempting token refresh...');
        const { token } = await oauth2Client.getAccessToken();
        res.json({
            success: true,
            status: 'Token is valid',
            tokenType: typeof token,
            message: 'Your Google API credentials are CORRECT.'
        });
    } catch (error) {
        console.error('[Diagnostic] Failure:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.data || 'No extra details'
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
        console.log('[Health Check] Verification: Attempting token refresh...');
        const { token } = await oauth2Client.getAccessToken();
        const profile = await gmail.users.getProfile({ userId: 'me' });
        gmailStatus = `connected as ${profile.data.emailAddress}`;
    } catch (err) {
        console.error('[Health Check] Auth Failure:', {
            msg: err.message,
            code: err.code,
            details: err.response?.data
        });
        gmailStatus = `error: ${err.message}${err.response?.data?.error_description ? ' (' + err.response.data.error_description + ')' : ''}`;
        diagnostics = {
            idLen: clientId.length,
            secretLen: clientSecret.length,
            idPrefix: clientId.substring(0, 10),
            secretPrefix: clientSecret.substring(0, 7)
        };
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
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} in GMAIL-API mode`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Gmail configured: ${!!process.env.GMAIL_USER}`);
});