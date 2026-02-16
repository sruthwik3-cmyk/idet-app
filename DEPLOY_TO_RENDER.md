# 🚀 Quick Deploy to Render - IDET App

## ✅ All Fixes Applied - Ready to Deploy!

---

## 🎯 What's Been Fixed

1. ✅ **Server Routing Error** - Changed `app.get('*')` to `app.get('/*')`
2. ✅ **Path-to-regexp** - Pinned to version 0.1.12
3. ✅ **TypeScript Issues** - Added proper type annotations
4. ✅ **Alert System** - Verified 15-second sound + 7/30-day alerts for ALL priorities
5. ✅ **Gmail API** - Using REST API (works on Render)

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Install Dependencies (Local Test)
```bash
npm install
```

### Step 2: Build the App (Local Test)
```bash
npm run build
```

### Step 3: Test Locally (Optional but Recommended)
```bash
npm start
```
Then visit: http://localhost:3000

If everything works locally, proceed to deployment!

---

### Step 4: Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment - All fixes applied"
git push origin main
```

---

### Step 5: Create Render Web Service

1. Go to: https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Click **Connect**

---

### Step 6: Configure Render Service

**Use these EXACT settings:**

| Setting | Value |
|---------|-------|
| Name | `idet-app` |
| Language | `Node` |
| Branch | `main` |
| Build Command | `npm install && npm run build` |
| Start Command | `node server.js` |

---

### Step 7: Add Environment Variables

Click **Environment** tab and add these 7 variables:

**Note**: Copy the Google credentials from your `.env` file or `RENDER_SETUP.txt`

```
NODE_VERSION=20

VITE_SUPABASE_URL=https://egnajcexpflszsgjarzt.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbmFqY2V4cGZsc3pzZ2phcnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODMyNTYsImV4cCI6MjA4NjA1OTI1Nn0.72fP2YWQ-UA2d0FozeJu0EqmP6wTr2Ro-0gZXQ7JmRw

GMAIL_USER=sriperambudururuthwik@gmail.com

GOOGLE_CLIENT_ID=[Copy from your .env file]

GOOGLE_CLIENT_SECRET=[Copy from your .env file]

GMAIL_REFRESH_TOKEN=[Copy from your .env file]
```

⚠️ **IMPORTANT**: Copy each value exactly - no extra spaces!

---

### Step 8: Deploy!

Click **Create Web Service**

Wait 3-5 minutes for deployment to complete.

Your app will be live at: `https://idet-app-XXXX.onrender.com`

---

## 🔧 POST-DEPLOYMENT (REQUIRED!)

### Step 9: Update Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click **Edit**
4. Add your Render URL to **Authorized JavaScript origins**:
   ```
   https://idet-app-XXXX.onrender.com
   ```
5. Add these to **Authorized redirect URIs**:
   ```
   https://idet-app-XXXX.onrender.com
   https://idet-app-XXXX.onrender.com/dashboard
   ```
6. Click **Save**

### Step 10: Update Supabase

1. Go to: https://supabase.com/dashboard/project/_/auth/url-configuration
2. Set **Site URL**:
   ```
   https://idet-app-XXXX.onrender.com
   ```
3. Add to **Redirect URLs**:
   ```
   https://idet-app-XXXX.onrender.com/**
   ```
4. Click **Save**

---

## ✅ VERIFY DEPLOYMENT

### Test 1: Health Check
Visit: `https://idet-app-XXXX.onrender.com/api/health`

Should see:
```json
{
  "status": "ok",
  "gmailStatus": "connected as sriperambudururuthwik@gmail.com",
  "mode": "gmail-api-rest"
}
```

### Test 2: Login
1. Visit your app URL
2. Click **Login with Google**
3. Should redirect and login successfully

### Test 3: Alert System
1. Add a document with expiry date 10 days from today
2. Wait 2-3 seconds
3. You should:
   - ✅ Hear 15-second alert sound
   - ✅ See browser notification
   - ✅ Receive email in Gmail

### Test 4: Urgent Alert
1. Add document with expiry date 5 days from today
2. Should trigger URGENT alert with "🚨" emoji
3. Check email for urgent notification

---

## 🎉 SUCCESS!

If all tests pass, your IDET app is fully deployed and working!

### Features Working:
- ✅ Google OAuth login
- ✅ Document management
- ✅ Real-time sync across devices
- ✅ 15-second alert sounds
- ✅ Email alerts via Gmail API
- ✅ 30-day warning alerts (8-30 days)
- ✅ 7-day urgent alerts (0-7 days)
- ✅ Works for ALL priorities (Critical, Important, Optional)
- ✅ Browser notifications
- ✅ Calendar integration

---

## 🐛 Troubleshooting

### Server won't start?
- Check Render logs for errors
- Verify all environment variables are set
- Make sure no extra spaces in credentials

### Login fails?
- Check Google Cloud Console redirect URIs
- Verify Supabase redirect URLs
- Make sure URLs match exactly (no trailing slashes)

### Alerts not working?
- Visit `/api/health` to check Gmail status
- Verify GMAIL_USER and credentials are correct
- Check browser console for errors
- Make sure user profile has valid email

### Sound doesn't play?
- Click anywhere on page first (browser autoplay policy)
- Check browser console for errors
- Try on different browser

---

## 📞 Need Help?

Check these files for more details:
- `RENDER_DEPLOYMENT_CHECKLIST.md` - Detailed deployment guide
- `FIXES_APPLIED.md` - All fixes and technical details
- `README.md` - Project overview

---

**Your app is ready to deploy! 🚀**

Just follow the steps above and you'll be live in minutes!
