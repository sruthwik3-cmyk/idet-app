import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function diagnose() {
    console.log("Starting email diagnosis...");
    console.log("User:", process.env.GMAIL_USER);
    // don't log password

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("Missing environment variables!");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    try {
        console.log("Verifying transporter...");
        await transporter.verify();
        console.log("Transporter verified successfully!");

        console.log("Sending test email...");
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to self
            subject: 'IDET Diagnostic Test',
            text: 'If you see this, your Gmail App Password is working!'
        });
        console.log("Email sent successfully!", info.messageId);
    } catch (error) {
        console.error("Diagnosis failed:", error);
    }
}

diagnose();
