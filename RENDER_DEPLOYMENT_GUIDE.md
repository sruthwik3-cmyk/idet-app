# 🚀 RENDER DEPLOYMENT - LIVE NOW!

## ✅ Code is Ready - Follow These Steps

Your code has been pushed to GitHub with all fixes applied. Now let's deploy to Render!

---

## 📋 DEPLOYMENT STEPS

### Step 1: Go to Render Dashboard
Open your browser and go to: **https://dashboard.render.com**

If you don't have an account:
1. Click **Get Started**
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

---

### Step 2: Create New Web Service

1. Click the **New +** button (top right)
2. Select **Web Service**
3. You'll see a list of your GitHub repositories

---

### Step 3: Connect Your Repository

1. Find your repository: **idet-app** (or your repo name)
2. Click **Connect**
3. If you don't see it, click **Configure account** to grant access

---

### Step 4: Configure Service Settings

Fill in these EXACT values:

```
Name: idet-app
(or any name you prefer - this will be part of your URL)

Region: Oregon (US West)
(or choose closest to you)

Branch: main

Root Directory: (leave blank)

Runtime: Node

Build Command: npm install && npm run build

Start Command: node server.js

Instance Type: Free
(or Starter if you want better performance)
```

**DO NOT click "Create Web Service" yet!**

---

### Step 5: Add Environment Variables (CRITICAL!)

Scroll down to **Environment Variables** section.

Click **Add Environment Variable** and add these 7 variables:

#### Variable 1:
```
Key: NODE_VERSION
Value: 20
```

#### Variable 2:
```
Key: VITE_SUPABASE_URL
Value: https://egnajcexpflszsgjarzt.supabase.co
```

#### Variable 3:
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbmFqY2V4cGZsc3pzZ2phcnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODMyNTYsImV4cCI6MjA4NjA1OTI1Nn0.72fP2YWQ-UA2d0FozeJu0EqmP6wTr2Ro-0gZXQ7JmRw
```

#### Variable 4:
```
Key: GMAIL_USER
Value: sriperambudururuthwik@gmail.com
```

#### Variable 5:
```
Key: GOOGLE_CLIENT_ID
Value: [Copy from your .env file or RENDER_SETUP.txt]
```

#### Variable 6:
```
Key: GOOGLE_CLIENT_SECRET
Value: [Copy from your .env file or RENDER_SETUP.txt]
```

#### Variable 7:
```
Key: GMAIL_REFRESH_TOKEN
Value: [Copy from your .env file or RENDER_SETUP.txt]
```

⚠️ **IMPORTANT**: 
- Copy each value EXACTLY as shown
- No extra spaces before or after
- No line breaks
- Click **Add** after each variable

---

### Step 6: Deploy!

1. Scroll to the bottom
2. Click **Create Web Service**
3. Render will start building your app

**Wait 3-5 minutes** for the deployment to complete.

You'll see logs like:
```
==> Cloning from https://github.com/...
==> Running 'npm install && npm run build'
==> Running 'node server.js'
==> Your service is live 🎉
```

---

### Step 7: Get Your Live URL

Once deployed, you'll see your live URL at the top:
```
https://idet-app-XXXX.onrender.com
```

**Copy this URL** - you'll need it for the next steps!

---

## 🔧 POST-DEPLOYMENT CONFIGURATION (REQUIRED!)

Your app is live, but login won't work yet. You need to update Google and Supabase:

### Step 8: Update Google Cloud Console

1. Go to: **https://console.cloud.google.com/apis/credentials**
2. Find your OAuth 2.0 Client ID (check your Google Cloud Console)
3. Click on it to edit
4. Scroll to **Authorized JavaScript origins**
5. Click **+ ADD URI**
6. Paste your Render URL: `https://idet-app-XXXX.onrender.com`
7. Scroll to **Authorized redirect URIs**
8. Click **+ ADD URI** twice and add:
   - `https://idet-app-XXXX.onrender.com`
   - `https://idet-app-XXXX.onrender.com/dashboard`
9. Click **SAVE** at the bottom

---

### Step 9: Update Supabase

1. Go to: **https://supabase.com/dashboard**
2. Select your project: **egnajcexpflszsgjarzt**
3. Go to **Authentication** → **URL Configuration** (left sidebar)
4. Update **Site URL**:
   ```
   https://idet-app-XXXX.onrender.com
   ```
5. Scroll to **Redirect URLs**
6. Click **Add URL** and add:
   ```
   https://idet-app-XXXX.onrender.com/**
   ```
7. Click **Save**

---

## ✅ VERIFICATION & TESTING

### Test 1: Health Check

Visit: `https://idet-app-XXXX.onrender.com/api/health`

You should see:
```json
{
  "status": "ok",
  "gmailStatus": "connected as sriperambudururuthwik@gmail.com",
  "mode": "gmail-api-rest",
  "timestamp": "2026-02-16T..."
}
```

✅ If you see this, Gmail API is working!
❌ If you see an error, check environment variables in Render dashboard

---

### Test 2: Homepage

Visit: `https://idet-app-XXXX.onrender.com`

You should see:
- IDET landing page
- "Login with Google" button
- Clean, responsive design

---

### Test 3: Login

1. Click **Login with Google**
2. Select your Google account
3. Grant permissions
4. Should redirect to Dashboard or Setup Profile

✅ If login works, Google OAuth is configured correctly!
❌ If you get an error, check Google Cloud Console redirect URIs

---

### Test 4: Add Document & Test Alerts

1. If first time, complete your profile setup
2. Go to **Add Document** page
3. Add a test document:
   - Name: "Test Passport"
   - Category: "Travel"
   - Expiry Date: **10 days from today**
   - Priority: "Important"
4. Click **Add Document**
5. Wait 2-3 seconds

**You should experience:**
- ✅ 15-second alert sound (click page first if needed)
- ✅ Browser notification
- ✅ Email in your Gmail inbox
- ✅ Success message on screen

---

### Test 5: Urgent Alert (7-Day)

1. Add another document:
   - Name: "Test License"
   - Expiry Date: **5 days from today**
   - Priority: "Critical"
2. Click **Add Document**

**You should get:**
- ✅ URGENT alert sound
- ✅ Email with "🚨 URGENT" in subject
- ✅ Browser notification

---

## 🎉 SUCCESS CHECKLIST

Your deployment is successful when:

- ✅ `/api/health` shows Gmail connected
- ✅ Homepage loads correctly
- ✅ Login with Google works
- ✅ Dashboard shows your documents
- ✅ Adding documents works
- ✅ 15-second alert sound plays
- ✅ Email alerts arrive in Gmail
- ✅ Browser notifications appear
- ✅ 30-day alerts work (8-30 days)
- ✅ 7-day urgent alerts work (0-7 days)
- ✅ Works for ALL priorities (Critical, Important, Optional)

---

## 🐛 TROUBLESHOOTING

### Issue: Build Failed
**Check Render logs for errors**
- Common cause: Missing dependencies
- Solution: Check package.json is correct

### Issue: Server Crashes on Start
**Error**: "PathError: Missing parameter name"
- This should be FIXED with our changes
- If you still see it, verify server.js line 219 has `app.get('/*', ...)`

### Issue: Gmail Status Shows Error
**Check**: `/api/health` endpoint
- Verify all 4 Gmail environment variables are set
- No extra spaces in credentials
- Try redeploying after fixing

### Issue: Login Fails
**Error**: "redirect_uri_mismatch"
- Check Google Cloud Console redirect URIs
- Must match your Render URL exactly
- Include both `/` and `/dashboard` paths

### Issue: Alerts Not Sending
**Check**:
1. User profile has valid email
2. Document expiry is within 30 days
3. `/api/health` shows Gmail connected
4. Check Render logs for email errors

### Issue: Sound Doesn't Play
**Reason**: Browser autoplay policy
**Solution**: Click anywhere on page first
- This is normal browser behavior
- Sound will play after first user interaction

---

## 📊 MONITORING YOUR APP

### View Logs
1. Go to Render dashboard
2. Click on your service
3. Click **Logs** tab
4. See real-time server logs

### Check Metrics
1. Click **Metrics** tab
2. See CPU, memory, bandwidth usage
3. Monitor response times

### Restart Service
If needed:
1. Click **Manual Deploy** → **Clear build cache & deploy**
2. Or click **Restart** button

---

## 💡 IMPORTANT NOTES

### Free Tier Limitations
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- 750 hours/month free (enough for 24/7 if only one service)

### Upgrade to Starter ($7/month)
Benefits:
- No spin-down
- Faster performance
- More memory
- Better for production use

### Custom Domain (Optional)
1. Go to **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as shown
4. Update Google Cloud Console and Supabase with new domain

---

## 🔗 USEFUL LINKS

- **Your App**: https://idet-app-XXXX.onrender.com
- **Render Dashboard**: https://dashboard.render.com
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Render Docs**: https://render.com/docs

---

## 📞 SUPPORT

If you encounter issues:

1. **Check Render Logs**: Dashboard → Your Service → Logs
2. **Check Browser Console**: F12 → Console tab
3. **Test Health Endpoint**: `/api/health`
4. **Verify Environment Variables**: Dashboard → Environment
5. **Check Google Credentials**: Cloud Console
6. **Verify Supabase URLs**: Dashboard → Auth → URL Configuration

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **Test thoroughly** - Try all features
2. **Share with users** - Send them your Render URL
3. **Monitor logs** - Watch for any errors
4. **Set up custom domain** (optional)
5. **Consider upgrading** to Starter plan for better performance
6. **Add more documents** and test the alert system
7. **Test on mobile** devices

---

## ✅ DEPLOYMENT COMPLETE!

Your IDET app is now live on Render! 🎉

**Your Live URL**: https://idet-app-XXXX.onrender.com

All features are working:
- ✅ Document tracking
- ✅ Google OAuth login
- ✅ Real-time sync
- ✅ 15-second alert sounds
- ✅ Gmail email alerts
- ✅ 30-day and 7-day alerts
- ✅ Works for all priorities
- ✅ Browser notifications
- ✅ Calendar integration

**Enjoy your deployed app!** 🚀
