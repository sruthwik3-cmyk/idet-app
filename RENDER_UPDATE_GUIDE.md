# 🔧 RENDER DEPLOYMENT FIX - Exit Status 1 Error

## ❌ Error: "Exited with status 1 while running your code"

This error means the build or server startup failed on Render. Let's fix it!

---

## 🔍 Common Causes & Solutions

### 1. Missing Environment Variables ⚠️

**Most Common Cause!**

Render needs ALL 7 environment variables to work:

```
NODE_VERSION=20
VITE_SUPABASE_URL=https://egnajcexpflszsgjarzt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GMAIL_USER=sriperambudururuthwik@gmail.com
GOOGLE_CLIENT_ID=[from your .env file]
GOOGLE_CLIENT_SECRET=[from your .env file]
GMAIL_REFRESH_TOKEN=[from your .env file]
```

**How to Fix:**
1. Go to Render Dashboard → Your Service
2. Click "Environment" tab
3. Verify ALL 7 variables are present
4. Check for extra spaces or line breaks
5. Click "Save Changes"
6. Redeploy

---

### 2. Build Command Issue

**Check Build Settings:**

Go to Render Dashboard → Settings

Make sure these are EXACTLY:
```
Build Command: npm install && npm run build
Start Command: node server.js
```

**NOT:**
- ❌ `npm run build` (missing npm install)
- ❌ `npm start` (wrong command)
- ❌ `node dist/server.js` (wrong path)

---

### 3. Node Version Mismatch

**Solution:**

Add this environment variable in Render:
```
NODE_VERSION=20
```

This ensures Render uses Node.js 20, which is compatible with your app.

---

### 4. Missing Dependencies

**Check Render Build Logs:**

Look for errors like:
- "Cannot find module 'express'"
- "Cannot find module 'googleapis'"
- "Module not found"

**Solution:**

Make sure `package.json` has all dependencies:
```json
{
  "dependencies": {
    "express": "^4.22.1",
    "googleapis": "^171.4.0",
    "cors": "^2.8.6",
    "dotenv": "^17.2.4",
    "@supabase/supabase-js": "^2.95.3",
    "path-to-regexp": "0.1.12"
  }
}
```

---

### 5. TypeScript Build Errors

**Check Render Build Logs for:**
- "TS2304: Cannot find name"
- "TS2345: Argument of type"
- "TS2322: Type 'X' is not assignable"

**Solution:**

Run locally first:
```bash
npm run build
```

Fix any TypeScript errors before deploying.

---

## 🚀 STEP-BY-STEP FIX

### Step 1: Check Render Logs

1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for the EXACT error message
5. Copy the error (we need this!)

### Step 2: Verify Environment Variables

1. Click "Environment" tab
2. Count the variables - should be 7
3. Check each one has a value (not empty)
4. Look for these specific ones:
   - `NODE_VERSION` = 20
   - `VITE_SUPABASE_URL` = starts with https://
   - `VITE_SUPABASE_ANON_KEY` = long JWT token
   - `GMAIL_USER` = your email
   - `GOOGLE_CLIENT_ID` = ends with .apps.googleusercontent.com
   - `GOOGLE_CLIENT_SECRET` = starts with GOCSPX-
   - `GMAIL_REFRESH_TOKEN` = starts with 1//

### Step 3: Check Build Settings

1. Click "Settings" tab
2. Scroll to "Build & Deploy"
3. Verify:
   - Build Command: `npm install && npm run build`
   - Start Command: `node server.js`
   - Branch: `main`

### Step 4: Clear Cache & Redeploy

1. Click "Manual Deploy" button
2. Select "Clear build cache & deploy"
3. Wait for deployment (3-5 minutes)
4. Check logs for errors

---

## 🔍 Debugging Render Logs

### Look for These Error Patterns:

#### Error 1: "Cannot find module"
```
Error: Cannot find module 'express'
```
**Fix:** Dependencies not installed. Check build command includes `npm install`

#### Error 2: "ENOENT: no such file or directory"
```
Error: ENOENT: no such file or directory, open '/opt/render/project/src/dist/index.html'
```
**Fix:** Build failed. Check TypeScript compilation succeeded

#### Error 3: "Missing environment variable"
```
Error: Missing Google API credentials
```
**Fix:** Add missing environment variables in Render dashboard

#### Error 4: "Port already in use"
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Fix:** This shouldn't happen on Render. Restart the service.

#### Error 5: "PathError: Missing parameter name"
```
PathError: Missing parameter name at index 1: *
```
**Fix:** This was already fixed! Make sure latest code is pushed to GitHub.

---

## ✅ Verification Steps

### After Deploying:

1. **Check Service Status**
   - Should show green "Live" indicator
   - Not red "Failed" or yellow "Building"

2. **Test Health Endpoint**
   - Visit: `https://your-app.onrender.com/api/health`
   - Should return JSON with status "ok"

3. **Test Homepage**
   - Visit: `https://your-app.onrender.com`
   - Should load the landing page

4. **Check Logs**
   - Should see: "Server is running on port 3000 in GMAIL-API mode"
   - No error messages

---

## 🛠️ Manual Deployment Test

### Test Locally First:

```bash
# 1. Install dependencies
npm install

# 2. Build the app
npm run build

# 3. Start the server
npm start

# 4. Test in browser
# Visit: http://localhost:3000
```

If this works locally, the issue is Render-specific (usually environment variables).

---

## 📋 Render Environment Variables Checklist

Copy these from your `.env` file:

- [ ] `NODE_VERSION` = 20
- [ ] `VITE_SUPABASE_URL` = https://egnajcexpflszsgjarzt.supabase.co
- [ ] `VITE_SUPABASE_ANON_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbmFqY2V4cGZsc3pzZ2phcnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODMyNTYsImV4cCI6MjA4NjA1OTI1Nn0.72fP2YWQ-UA2d0FozeJu0EqmP6wTr2Ro-0gZXQ7JmRw
- [ ] `GMAIL_USER` = sriperambudururuthwik@gmail.com
- [ ] `GOOGLE_CLIENT_ID` = [from .env]
- [ ] `GOOGLE_CLIENT_SECRET` = [from .env]
- [ ] `GMAIL_REFRESH_TOKEN` = [from .env]

---

## 🔄 Force Redeploy

If nothing works:

1. Go to Render Dashboard
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"
4. Wait for fresh deployment
5. Check logs carefully

---

## 📞 Share Render Logs

If still failing, I need to see the EXACT error from Render logs:

1. Go to Render Dashboard → Logs
2. Scroll to the error (red text)
3. Copy the full error message
4. Share it with me

Common log locations:
- Build logs: Shows npm install and build process
- Deploy logs: Shows server startup
- Runtime logs: Shows server errors after startup

---

## 🎯 Most Likely Fix

**90% of "Exit status 1" errors are caused by:**

1. Missing environment variables (especially Gmail ones)
2. Wrong build/start commands
3. Missing `NODE_VERSION=20`

**Quick Fix:**
1. Double-check ALL 7 environment variables
2. Make sure build command is: `npm install && npm run build`
3. Make sure start command is: `node server.js`
4. Add `NODE_VERSION=20` if missing
5. Redeploy

---

## ✅ Success Indicators

Deployment is successful when:
- ✅ Render shows green "Live" status
- ✅ Logs show: "Server is running on port 3000"
- ✅ `/api/health` returns JSON
- ✅ Homepage loads
- ✅ No error messages in logs

---

**Need the exact error message from Render logs to provide specific fix!**
