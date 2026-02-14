# 📧 EmailJS Setup Guide (Required for Render)

Render blocks direct email ports (465, 587), so we must use **EmailJS** to send emails securely from the browser.

## 1. Create a Free Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/) and Sign Up (Free Tier allows 200 emails/month).

## 2. Add Email Service
1. Click **"Email Services"** in the sidebar.
2. Click **"Add New Service"**.
3. Select **"Gmail"**.
4. Click **"Connect Account"** and login with your sending Gmail.
5. Click **"Create Service"**.
6. **Copy the Service ID** (e.g., `service_xyz123`).

## 3. Create Email Template
1. Click **"Email Templates"** in the sidebar.
2. Click **"Create New Template"**.
3. **Subject**: `{{subject}}` (or customize it)
4. **Content**:
   ```html
   <h2>Document Expiry Alert</h2>
   <p>Your document <strong>{{doc_name}}</strong> expires on <strong>{{expiry_date}}</strong>.</p>
   <p><strong>Days Left:</strong> {{days_left}}</p>
   <p>Priority: {{priority}}</p>
   <p><a href="{{calendar_url}}">Add to Calendar</a></p>
   ```
5. Click **"Save"**.
6. **Copy the Template ID** (e.g., `template_abc456`).

## 4. Get Public Key
1. Click **"Account"** (bottom left avatar) -> **"Public Key"**.
2. **Copy the Public Key** (e.g., `user_123...` or just a random string).

## 5. Add Keys to Render Environment
Go to your Render Dashboard -> Environment:

| Key | Value |
|---|---|
| `VITE_EMAILJS_SERVICE_ID` | (Your Service ID from Step 2) |
| `VITE_EMAILJS_TEMPLATE_ID` | (Your Template ID from Step 3) |
| `VITE_EMAILJS_PUBLIC_KEY` | (Your Public Key from Step 4) |

> **Note**: Do NOT remove the old `GMAIL_USER` keys yet if you want to keep them for reference, but the app will now use these new VITE keys.
