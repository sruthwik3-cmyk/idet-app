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
        throw new Error('Missing Google API credentials (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, or GMAIL_USER).');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * Creates a raw RFC822 message for Gmail API.
 */
const createRawMessage = (to, subject, html, text) => {
    const str = [
        `Content-Type: text/html; charset="UTF-8"\n`,
        `MIME-Version: 1.0\n`,
        `Content-Transfer-Encoding: 7bit\n`,
        `to: ${to}\n`,
        `from: "IDET Alerts" <${process.env.GMAIL_USER}>\n`,
        `subject: ${subject}\n\n`,
        html || text
    ].join('');

    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

// API Endpoint for sending emails using Gmail API (REST)
app.post('/api/send-email', async (req, res) => {
    const timestamp = new Date().toISOString();
    const { to, subject, html, text } = req.body;

    console.log(`[${timestamp}] [Gmail API] Request for: ${to}`);

    try {
        const gmail = await getGmailClient();
        const raw = createRawMessage(to, subject, html, text);

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw }
        });

        console.log(`[${timestamp}] [Gmail API] Success! Message ID: ${response.data.id}`);
        res.json({ success: true, messageId: response.data.id });
    } catch (error) {
        console.error(`[${timestamp}] [Gmail API] CRITICAL ERROR:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// App health/status endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
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