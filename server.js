// server.js

const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// Middleware for logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Gmail OAuth2 setup
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

app.use(express.json());
// route to send email
app.post('/send', async (req, res) => {
    const { to, subject, text } = req.body;

    try {
        oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to,
            subject,
            text,
        };

        const result = await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent', messageId: result.messageId });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Health endpoint
app.get('/health', async (req, res) => {
    try {
        // Check if OAuth2 credentials are valid
        oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
        const accessToken = await oauth2Client.getAccessToken();

        if (accessToken.token) {
            return res.status(200).json({ message: 'Service is healthy!', messageId: null });
        } else {
            return res.status(500).json({ message: 'Invalid OAuth2 credentials', messageId: null });
        }
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ message: 'Health check failed', error: error.message, messageId: null });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});