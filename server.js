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

// Helper: Create a base64-encoded email in RFC 2822 format
function createRawEmail({ from, to, subject, html, text }) {
    const boundary = 'boundary_' + Date.now();
    const messageParts = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        text || '',
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        '',
        html || '',
        `--${boundary}--`,
    ];
    const message = messageParts.join('\r\n');
    // Base64url encode
    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// API Endpoint for sending emails via Gmail API (HTTPS, not SMTP)
app.post('/api/send-email', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Received email request`);
    const { to, subject, html, text } = req.body;

    console.log(`To: ${to}, Subject: ${subject}`);

    if (!to || !subject || (!html && !text)) {
        console.error("Missing required fields");
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const gmailUser = process.env.GMAIL_USER;

    if (!clientId || !clientSecret || !refreshToken || !gmailUser) {
        console.error("Missing Gmail API credentials. Need: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_USER");
        return res.status(500).json({
            error: "Server misconfiguration: Missing Gmail API credentials.",
            missing: {
                GOOGLE_CLIENT_ID: !clientId,
                GOOGLE_CLIENT_SECRET: !clientSecret,
                GMAIL_REFRESH_TOKEN: !refreshToken,
                GMAIL_USER: !gmailUser
            }
        });
    }

    try {
        // Step 1: Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        // Step 2: Get fresh access token
        console.log('[Gmail API] Getting access token...');
        const { token } = await oauth2Client.getAccessToken();
        console.log('[Gmail API] Access token obtained');

        // Step 3: Create Gmail API instance
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Step 4: Create the raw email
        const rawEmail = createRawEmail({
            from: gmailUser,
            to: to,
            subject: subject,
            html: html,
            text: text
        });

        // Step 5: Send via Gmail API (HTTPS, not SMTP!)
        console.log(`[Gmail API] Sending email from ${gmailUser} to ${to}...`);
        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawEmail
            }
        });

        console.log('[Gmail API] Email sent successfully! Message ID:', result.data.id);
        return res.status(200).json({
            message: "Email sent successfully",
            messageId: result.data.id
        });

    } catch (error) {
        console.error("[Gmail API] Error:", error.message);
        if (error.response) {
            console.error("[Gmail API] Response data:", JSON.stringify(error.response.data));
        }
        return res.status(500).json({
            error: "Failed to send email",
            details: error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    const emailConfigured = !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GMAIL_REFRESH_TOKEN &&
        process.env.GMAIL_USER
    );
    res.json({
        status: 'ok',
        emailService: emailConfigured ? 'configured (Gmail API)' : 'missing_credentials',
        timestamp: new Date().toISOString()
    });
});

// Catch-all for SPA routing
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Email service: Gmail API (HTTPS mode)`);
});
