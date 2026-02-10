import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
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

    try {
        // Create Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: to,
            subject: subject,
            text: text,
            html: html
        };

        console.log("Attempting to send email...");
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);

        return res.status(200).json({ message: "Email sent successfully", info });

    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email", details: error.message });
    }
});

// Catch-all handler for any request that doesn't match an API route or static file
// This is critical for SPA (Single Page Application) routing to work
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
