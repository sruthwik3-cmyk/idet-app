# Deployment Guide (Render)

Your application is now configured as a **Node.js Web Service**. This means it runs a lightweight server to handle both the website and the email sending.

## Step 1: Push to GitHub
Make sure your latest code (including `server.js` and `package.json` changes) is pushed to your GitHub repository.

## Step 2: Create Web Service on Render
1.  Go to [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.

## Step 3: Configure Service (CRITICAL)
Use the following settings:

*   **Name:** `idet-app` (or your choice)
*   **Language:** `Node`
*   **Branch:** `main` (or your working branch)
*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `node server.js`

## Step 4: Environment Variables (REQUIRED)
You **MUST** add these variables for the app to work.
Go to the **Environment** tab in your new Render service and add:

| Key | Value |
| :--- | :--- |
| `NODE_VERSION` | `20` (Recommended) |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `GMAIL_USER` | Your full Gmail address |
| `GMAIL_APP_PASSWORD` | Your 16-char App Password |

## Step 5: Verify
Once the deploy finishes (it may take a few minutes), visit the URL provided by Render.
1.  **Check the site loads:** Login and view dashboard.
2.  **Check Emails:** Trigger an alert or wait for an auto-alert to verify email sending works.
