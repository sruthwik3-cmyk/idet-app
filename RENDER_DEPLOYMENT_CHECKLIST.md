# 🚀 RENDER DEPLOYMENT CHECKLIST - IDET App

## ✅ Pre-Deployment Verification (COMPLETED)

### 1. Code Fixes Applied
- ✅ **Server Route Fix**: Changed `app.get('*', ...)` to `app.get('/*', ...)` in server.js (line 219)
- ✅ **TypeScript Fixes**: Added proper type annotations in AppContext.tsx
- ✅ **Path-to-regexp**: Pinned to version 0.1.12 to prevent routing errors
- ✅ **No Diagnostics**: All files pass TypeScript/ESLint checks

### 2. Alert System Verification
- ✅ **15-Second Sound**: Plays 5 loops (~2.8s each) with 15s failsafe timeout
- ✅ **30-Day Alerts**: Triggers when 8-30 days remain (ALL priorities)
- ✅ **7-Day Alerts**: Triggers when 0-7 days remain (ALL priorities)
- ✅ **Priority Support**: Works for Critical, Important, AND Optional documents
- ✅ **Gmail API**: Uses REST API (not SMTP) - compatible with Render
- ✅ **Session Dedup**: Prevents duplicate alerts within same session

### 3. Gmail API Configuration
- ✅ **Credentials Present**: All 4 required environment variables in .env
  - GMAIL_USER
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - GMAIL_REFRESH_TOKEN
- ✅ **Backend Endpoint**: `/api/send-email` configured correctly
- ✅ **Health Check**: `/api/health` endpoint for diagnostics

---

## 📋 RENDER DEPLOYMENT STEPS

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Fix: Server routing and alert system for Render deployment"
git push origin main
```

### Step 2: Create Render Web Service
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `idet-app`
4. Click **Connect**

### Step 3: Configure Build Settings
Use these EXACT settings:

| Setting | Value |
|---------|-------|
| **Name** | `idet-app` (or your choice) |
| **Language** | `Node` |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free (or Starter) |

### Step 4: Add Environment Variables
Go to **Environment** tab and add these variables:

| Key | Value | Source |
|-----|-------|--------|
| `NODE_VERSION` | `20` | Manual |
| `VITE_SUPABASE_URL` | `https://egnajcexpflszsgjarzt.supabase.co` | From .env |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | From .env |
| `GMAIL_USER` | `sriperambudururuthwik@gmail.com` | From .env |
| `GOOGLE_CLIENT_ID` | `[Copy from .env]` | From .env |
| `GOOGLE_CLIENT_SECRET` | `[Copy from .env]` | From .env |
| `GMAIL_REFRESH_TOKEN` | `[Copy from .env]` | From .env |

⚠️ **IMPORTANT**: Copy-paste carefully! No extra spaces or line breaks!

### Step 5: Deploy
1. Click **Create Web Service**
2. Wait for build to complete (~3-5 minutes)
3. Note your deployment URL: `https://idet-app-XXXX.onrender.com`

---

## 🔧 POST-DEPLOYMENT CONFIGURATION

### Step 6: Update Google Cloud Console
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Click **Edit**
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-app-name.onrender.com
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-app-name.onrender.com
   https://your-app-name.onrender.com/dashboard
   ```
6. Click **Save**

### Step 7: Update Supabase
1. Go to [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)
2. Set **Site URL**:
   ```
   https://your-app-name.onrender.com
   ```
3. Add to **Redirect URLs**:
   ```
   https://your-app-name.onrender.com/**
   ```
4. Click **Save**

---

## ✅ VERIFICATION TESTS

### Test 1: Server Health
Visit: `https://your-app-name.onrender.com/api/health`

Expected response:
```json
{
  "status": "ok",
  "gmailStatus": "connected as sriperambudururuthwik@gmail.com",
  "mode": "gmail-api-rest",
  "timestamp": "2024-..."
}
```

### Test 2: Login
1. Visit your app URL
2. Click **Login with Google**
3. Should redirect to Google OAuth
4. After login, should see Dashboard

### Test 3: Alert System
1. Go to **Add Document** page
2. Add a test document with expiry date 10 days from today
3. Wait 2-3 seconds
4. You should:
   - ✅ Hear 15-second alert sound
   - ✅ See browser notification
   - ✅ Receive email at your Gmail

### Test 4: 7-Day Alert
1. Add document with expiry date 5 days from today
2. Should trigger URGENT alert immediately
3. Check email for "🚨 URGENT" subject line

---

## 🐛 TROUBLESHOOTING

### Issue: "PathError: Missing parameter name"
**Status**: ✅ FIXED - Changed route from `*` to `/*`

### Issue: Gmail alerts not working
**Check**:
1. Visit `/api/health` endpoint
2. Look at `gmailStatus` field
3. If error, check environment variables in Render dashboard
4. Ensure no extra spaces in credentials

### Issue: Login fails
**Check**:
1. Google Cloud Console → Authorized redirect URIs
2. Must include your exact Render URL
3. Supabase → Redirect URLs must include `/**` wildcard

### Issue: Sound doesn't play
**Reason**: Browser autoplay policy requires user interaction first
**Solution**: User must click anywhere on page before sound can play

### Issue: Alerts not triggering
**Check**:
1. Document expiry date is within 30 days
2. User profile has valid email
3. Check browser console for errors
4. Visit `/api/health` to verify Gmail connection

---

## 📊 ALERT SYSTEM BEHAVIOR

### 30-Day Alert (Warning)
- **Triggers**: When 8-30 days remain
- **Frequency**: Once per document per session
- **Actions**:
  - Plays 15-second sound
  - Sends email with "Reminder" subject
  - Shows browser notification
  - Updates database (emailSent30: true)

### 7-Day Alert (Urgent)
- **Triggers**: When 0-7 days remain
- **Frequency**: Once per document per session
- **Actions**:
  - Plays 15-second sound
  - Sends email with "🚨 URGENT" subject
  - Shows browser notification
  - Updates database (emailSent7: true)

### Priority Handling
- **ALL priorities get alerts**: Critical, Important, Optional
- Priority only affects email content, not whether alert is sent
- Both 30-day and 7-day alerts work for all priorities

---

## 🎯 SUCCESS CRITERIA

Your deployment is successful when:
- ✅ Server starts without errors
- ✅ `/api/health` shows Gmail connected
- ✅ Login with Google works
- ✅ Dashboard loads with user data
- ✅ Adding documents works
- ✅ 15-second alert sound plays
- ✅ Email alerts arrive in Gmail
- ✅ Browser notifications appear
- ✅ Real-time sync works across devices

---

## 📝 NOTES

- **Free Tier**: Render free tier spins down after 15 minutes of inactivity
- **Cold Start**: First request after spin-down takes ~30 seconds
- **Logs**: Check Render dashboard → Logs tab for debugging
- **Database**: Supabase free tier includes 500MB storage
- **Gmail API**: No daily limit for personal use

---

## 🔗 USEFUL LINKS

- Render Dashboard: https://dashboard.render.com
- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Supabase Dashboard: https://supabase.com/dashboard
- Your App (after deployment): https://your-app-name.onrender.com

---

**Last Updated**: February 16, 2026
**Version**: 1.2.2 - Final Server Stability & Interface Polish
