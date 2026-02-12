import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'dns';
import { promisify } from 'util';

// Force IPv4 globally
dns.setDefaultResultOrder('ipv4first');

const resolve4 = promisify(dns.resolve4);

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

// API Endpoint for sending emails
app.post('/api/send-email', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Received email request`);
    const { to, subject, html, text } = req.body;

    console.log(`To: ${to}, Subject: ${subject}`);

    if (!to || !subject || (!html && !text)) {
        console.error("Missing required fields");
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("Missing Gmail credentials in environment variables.");
        return res.status(500).json({ error: "Server misconfiguration: Missing email credentials." });
    }

    try {
        // Step 1: Manually resolve smtp.gmail.com to IPv4
        let smtpHost = 'smtp.gmail.com';
        try {
            const addresses = await resolve4('smtp.gmail.com');
            if (addresses && addresses.length > 0) {
                smtpHost = addresses[0]; // Use first IPv4 address (e.g., 142.250.x.x)
                console.log(`[DNS] Resolved smtp.gmail.com to IPv4: ${smtpHost}`);
            }
        } catch (dnsErr) {
            console.warn(`[DNS] Could not resolve IPv4, using hostname: ${dnsErr.message}`);
        }

        // Step 2: Create transporter with the IPv4 address
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            },
            tls: {
                // Required when using IP address instead of hostname
                servername: 'smtp.gmail.com',
                rejectUnauthorized: false
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 15000
        });

        // Step 3: Verify connection
        console.log(`[SMTP] Connecting to ${smtpHost}:587...`);
        await transporter.verify();
        console.log(`[SMTP] Connection verified successfully!`);

        // Step 4: Send email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: to,
            subject: subject,
            text: text,
            html: html
        };

        console.log(`[SMTP] Sending email from ${process.env.GMAIL_USER}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log("[SMTP] Email sent successfully:", info.messageId);

        return res.status(200).json({ message: "Email sent successfully", info });

    } catch (error) {
        console.error("[SMTP] Error sending email:", error.message);
        return res.status(500).json({ error: "Failed to send email", details: error.message });
    }
});

app.get('/api/health', (req, res) => {
    const emailConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    res.json({
        status: 'ok',
        emailService: emailConfigured ? 'configured' : 'missing_credentials',
        timestamp: new Date().toISOString()
    });
});

// Catch-all for SPA routing
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
