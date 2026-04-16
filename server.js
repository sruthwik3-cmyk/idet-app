/**
 * IDET Server - Document Expiry Tracking System
 * Handles Gmail API alerts and serves the React frontend
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { google } from 'googleapis';
import { existsSync } from 'fs';

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
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "https://apis.google.com"],
            "connect-src": ["'self'", "https://egnajcexpflszsgjarzt.supabase.co"],
            "img-src": ["'self'", "data:", "https://*.google.com"]
        }
    }
}));
app.use(cors({
    origin: (origin, callback) => {
        // Allow no origin (e.g. mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://idet.vercel.app',
            'https://idet-app-1.onrender.com'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.onrender.com')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json({ limit: '1mb' })); // Increased limit to accommodate large HTML email templates
// Middleware to handle JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('[Middleware] JSON Parse Error:', err.message);
        return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
    }
    next();
});

// Serve static files from the 'dist' directory
const distPath = path.join(__dirname, 'dist');
console.log('[Startup] Dist path:', distPath);

// Check if dist folder exists
if (!existsSync(distPath)) {
    console.error('[ERROR] dist folder not found! Build may have failed.');
    console.error('[ERROR] Please run "npm run build" before starting the server.');
    process.exit(1);
}

app.use(express.static(distPath));

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

// Rate limiting for sensitive API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 50, // Limit each IP to 50 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10, // Limit to 10 emails per hour per IP to prevent spam abuse
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Email limit reached. Please try again in an hour.' }
});

// API Endpoint for sending emails using Gmail API (REST)
app.post('/api/send-email', emailLimiter, async (req, res) => {
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
            hint: error.message.includes('unauthorized_client') 
                ? 'Your Client ID/Secret do not match the Refresh Token. Ensure you used the SAME Client ID/Secret in BOTH Google Playground and Render.'
                : (error.message.includes('invalid_client')
                    ? 'Check your Google Client ID and Secret in Render/Supabase. One of them is likely incorrect.'
                    : (error.message.includes('invalid_grant') ? 'Your Refresh Token is invalid or expired. Please re-generate it.' : 'Check your Google Cloud settings.')),
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
app.get('/api/diagnose-gmail', apiLimiter, async (req, res) => {
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