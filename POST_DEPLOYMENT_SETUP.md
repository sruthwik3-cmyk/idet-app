# Post-Deployment Setup Guide

## Your Render URL
`https://idet-app-1.onrender.com`

---

## STEP 1: Update Google Cloud Console (5 minutes)

### What you're doing:
Telling Google that your app is now hosted on Render, so users can log in with Google OAuth.

### Direct Link:
**https://console.cloud.google.com/apis/credentials**

### Steps:

1. **Open the link above** - it will take you to Google Cloud Console Credentials page

2. **Sign in** with your Google account (sriperambudururuthwik@gmail.com)

3. **Find your OAuth 2.0 Client ID**
   - Look for a client ID that starts with: `543150771760-hk0lemsskt6kpg1oj4ce5itfniqa5ac9`
   - Click on it to open the settings

4. **Add Authorized JavaScript origins**
   - Scroll down to "Authorized JavaScript origins"
   - Click "+ ADD URI"
   - Enter: `https://idet-app-1.onrender.com`
   - Click "Add" or press Enter

5. **Add Authorized redirect URIs**
   - Scroll down to "Authorized redirect URIs"
   - Click "+ ADD URI"
   - Enter: `https://idet-app-1.onrender.com`
   - Click "+ ADD URI" again
   - Enter: `https://idet-app-1.onrender.com/callback`
   - Click "Add" or press Enter

6. **Save changes**
   - Scroll to the bottom
   - Click the blue "SAVE" button
   - Wait for "Client ID updated" confirmation

### What it should look like:
```
Authorized JavaScript origins:
✓ http://localhost:5173 (your local dev)
✓ https://idet-app-1.onrender.com (NEW - your production)

Authorized redirect URIs:
✓ http://localhost:5173 (your local dev)
✓ https://idet-app-1.onrender.com (NEW)
✓ https://idet-app-1.onrender.com/callback (NEW)
```

---

## STEP 2: Update Supabase Auth Configuration (3 minutes)

### What you're doing:
Telling Supabase that your app is now hosted on Render, so authentication redirects work correctly.

### Direct Link:
**https://supabase.com/dashboard/project/egnajcexpflszsgjarzt/auth/url-configuration**

### Steps:

1. **Open the link above** - it will take you directly to Supabase URL Configuration

2. **Sign in** to Supabase if needed

3. **Update Site URL**
   - Find the "Site URL" field at the top
   - Change it from `http://localhost:5173` to: `https://idet-app-1.onrender.com`

4. **Add Redirect URLs**
   - Scroll down to "Redirect URLs" section
   - You should see a text area with URLs listed (one per line)
   - Add this line: `https://idet-app-1.onrender.com/**`
   - Keep your localhost URL for local development: `http://localhost:5173/**`

5. **Save changes**
   - Click the green "Save" button at the bottom
   - Wait for "Successfully updated settings" message

### What it should look like:
```
Site URL:
https://idet-app-1.onrender.com

Redirect URLs:
http://localhost:5173/**
https://idet-app-1.onrender.com/**
```

---

## STEP 3: Test Your Deployment (5 minutes)

### Test 1: Check Server Health

1. **Open this link in your browser:**
   `https://idet-app-1.onrender.com/api/health`

2. **What you should see:**
   ```json
   {
     "status": "ok",
     "gmailStatus": "connected as sriperambudururuthwik@gmail.com",
     "mode": "gmail-api-rest",
     "timestamp": "2026-02-16T..."
   }
   ```

3. **If you see an error:**
   - Check that all 7 environment variables are set in Render
   - Make sure there are no extra spaces in the values
   - Try clicking "Manual Deploy" in Render to redeploy

### Test 2: Test Login

1. **Open your app:**
   `https://idet-app-1.onrender.com`

2. **Click "Sign in with Google"**

3. **You should be able to:**
   - Log in with your Google account
   - See the Dashboard
   - No errors in the browser console (press F12 to check)

### Test 3: Test Document & Alerts

1. **Add a test document:**
   - Click "Add Document"
   - Fill in details:
     - Name: "Test Passport"
     - Type: "Passport"
     - Expiry Date: **5 days from today** (to trigger 7-day alert)
     - Priority: "Critical"
   - Click "Save"

2. **Check if document appears:**
   - Go back to Dashboard
   - You should see "Test Passport" in the list

3. **Check for alerts:**
   - You should hear a 15-second sound alert
   - Check your email (sriperambudururuthwik@gmail.com) for alert email
   - If no email, check spam folder

4. **Test 30-day alert:**
   - Add another document with expiry date **20 days from today**
   - Should trigger 30-day alert (sound + email)

---

## Quick Reference Links

| Service | Purpose | Link |
|---------|---------|------|
| **Your App** | Live application | https://idet-app-1.onrender.com |
| **Health Check** | Test Gmail API | https://idet-app-1.onrender.com/api/health |
| **Render Dashboard** | Monitor deployment | https://dashboard.render.com |
| **Google Cloud** | OAuth settings | https://console.cloud.google.com/apis/credentials |
| **Supabase Auth** | URL configuration | https://supabase.com/dashboard/project/egnajcexpflszsgjarzt/auth/url-configuration |
| **OAuth Playground** | Refresh token (if needed) | https://developers.google.com/oauthplayground |

---

## Troubleshooting

### Problem: "gmailStatus" shows error in /api/health

**Solution:**
1. Go to Render Dashboard
2. Click on your service "idet-app-1"
3. Go to "Environment" tab
4. Check all 7 variables are set correctly (no extra spaces)
5. Click "Manual Deploy" to redeploy

### Problem: Can't log in with Google

**Solution:**
1. Make sure you completed STEP 1 (Google Cloud Console)
2. Check that you saved the changes
3. Try logging out and back in
4. Clear browser cache and try again

### Problem: No alerts received

**Solution:**
1. Check /api/health shows "connected as your-email"
2. Make sure document expiry is within 0-30 days
3. Check spam folder for emails
4. Check browser console (F12) for JavaScript errors
5. Make sure you clicked somewhere on the page to enable audio

### Problem: Render shows "Exit status 1"

**Solution:**
1. Check the Render logs for specific error
2. Make sure googleapis is version 134.0.0 in package.json
3. Try "Manual Deploy" > "Clear build cache & deploy"

---

## Alert System Summary

✅ **30-day alert**: Documents expiring in 8-30 days
✅ **7-day alert**: Documents expiring in 0-7 days  
✅ **No alerts**: Documents >30 days away
✅ **Sound**: 15 seconds (plays automatically)
✅ **Email**: Real Gmail via Gmail API
✅ **Priority**: Works for ALL priorities (Critical, Important, Optional)

---

## Need Help?

If something doesn't work:
1. Check the Render logs (Events tab)
2. Check browser console (F12 > Console tab)
3. Test /api/health endpoint
4. Verify all environment variables in Render
5. Make sure Google Cloud and Supabase URLs are saved correctly
