# Deployment Guide (Render)

Your app is fully configured and uploaded to GitHub. Now, deploy it to the web.

## v1.1 Update: Jarvis & Reliability
- **New Feature**: "Jarvis" Voice Command Interface. Hands-free control and audio summaries.
- **Reliability**: Diagnostic Health Check for Gmail Alerts.
- **Bug Fix**: Improved error handling for email delivery.

## Step 1: Connect to Render
1.  Go to **[dashboard.render.com](https://dashboard.render.com)** and log in.
2.  Click **New +** and select **Web Service**.
3.  Scroll to **Connect a repository** and find your repo: `idet-app` (or `sruthwik3-cmyk/idet-app`).
4.  Click **Connect**.

## Step 3: Configure Service (CRITICAL)
Use the following settings:

*   **Name:** `idet-app` (or your choice)
*   **Language:** `Node`
*   **Branch:** `main` (or your working branch)
*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `node server.js`

## Step 4: Environment Variables (Manual Copy-Paste)
You **MUST** add these variables for the app to work.
Go to the **Environment** tab in your new Render service and add:

| Key | Value (See `RENDER_SETUP.txt` for your secrets) |
| :--- | :--- |
| `NODE_VERSION` | `20` |
| `VITE_SUPABASE_URL` | *(Copy from RENDER_SETUP.txt)* |
| `VITE_SUPABASE_ANON_KEY` | *(Copy from RENDER_SETUP.txt)* |
| `GMAIL_USER` | *(Copy from RENDER_SETUP.txt)* |
| `GMAIL_APP_PASSWORD` | *(Copy from RENDER_SETUP.txt)* |

## Step 5: Post-Deployment Config (CRITICAL)
Your LIVE URL is: **`https://idet-app-a0qv.onrender.com`**

### 1. Update Google Cloud (For Login)
1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Edit your **Web client** (the OAuth 2.0 Client ID).
3.  Add this to **Authorized JavaScript origins**:
    - `https://idet-app-a0qv.onrender.com`
4.  Add these TWO URLs to **Authorized redirect URIs**:
    - `https://idet-app-a0qv.onrender.com`
    - `https://idet-app-a0qv.onrender.com/dashboard`
5.  Click **Save**.

### 2. Update Supabase (For Auth)
1.  Go to [Supabase Dashboard > Authentication > URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration).
2.  Add this to **Site URL**:
    - `https://idet-app-a0qv.onrender.com`
3.  Add this to **Redirect URLs**:
    - `https://idet-app-a0qv.onrender.com/**`
4.  Click **Save**.

## Step 6: Verify
1.  **Visit your Site:** Go to the Render URL.
2.  **Login:** Try logging in with Google. (If it fails, check Step 5).
3.  **Test Alert:** Go to Profile > "Test Alert".
    - You should hear the sound (User Interaction required first).
    - You should get a browser notification.
    - You should receive an email within seconds.

## Troubleshooting
### Gmail Alerts Not Working?
1.  Go to the **Profile** page in the app.
2.  Look at the **"Gmail Alerts Service"** section.
3.  **Status Indicator:**
    - `ONLINE` (Green): Server is configured correctly.
    - `OFFLINE` (Red): Server is missing `GMAIL_USER` or `GMAIL_APP_PASSWORD`.
4.  **Action:** If OFFLINE, go to your Render Dashboard -> Environment, and ensure the variables are set correctly (no spaces!).
