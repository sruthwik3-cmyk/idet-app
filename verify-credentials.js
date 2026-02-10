import 'dotenv/config';
import nodemailer from 'nodemailer';

async function verify() {
    console.log("Verifying Gmail credentials...");
    console.log("User:", process.env.GMAIL_USER);
    // console.log("Pass:", process.env.GMAIL_APP_PASSWORD); 

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("Error: Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    try {
        await transporter.verify();
        console.log("Success! SMTP connection established.");

        // Optional: Send a real email
        /*
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, 
            subject: "Verification Test",
            text: "Credentials are working!"
        });
        console.log("Test email sent:", info.messageId);
        */
        return true;
    } catch (error) {
        console.error("Verification failed:", error);
        return false;
    }
}

verify();
