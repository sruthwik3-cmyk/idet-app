import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

dotenv.config();

const createTransporter = async () => {
    const gmailUser = process.env.GMAIL_USER;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const appPassword = process.env.GMAIL_APP_PASSWORD;

    console.log('--- Configuration Check ---');
    console.log('GMAIL_USER:', gmailUser ? 'Set' : 'Missing');
    console.log('GOOGLE_CLIENT_ID:', clientId ? 'Set' : 'Missing');
    console.log('GMAIL_APP_PASSWORD:', appPassword ? 'Set' : 'Missing');
    console.log('---------------------------');

    if (!gmailUser) {
        throw new Error('GMAIL_USER is missing');
    }

    // Step A: Attempt OAuth2
    if (clientId && clientSecret && refreshToken) {
        console.log('[Test] Attempting OAuth2...');
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        try {
            const { token } = await oauth2Client.getAccessToken();
            console.log('[Test] OAuth2 Token retrieved.');
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
            console.error('[Test] OAuth2 Failed:', err.message);
        }
    }

    // Step B: Fallback to App Password
    if (appPassword) {
        console.log('[Test] Using App Password...');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: appPassword
            }
        });
    }

    throw new Error('No valid credentials found.');
};

const runTest = async () => {
    try {
        console.log('Starting Email Test...');
        const transporter = await createTransporter();
        await transporter.verify();
        console.log('Transporter Verified!');

        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to self
            subject: 'IDET Standalone Test',
            text: 'If you receive this, the backend email config is CORRECT.'
        });

        console.log('Email sent successfully!', info.messageId);
    } catch (error) {
        console.error('TEST FAILED:', error);
    }
};

runTest();
