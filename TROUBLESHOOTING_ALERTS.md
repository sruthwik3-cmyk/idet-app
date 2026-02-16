# 🔧 TROUBLESHOOTING GUIDE - Alerts & Document Saving

## 🎯 Quick Fixes

### Issue 1: Documents Not Showing in Dashboard

**Steps to Fix:**

1. **Check if you're logged in**
   - Look for your profile icon in the top right
   - If not logged in, click "Login with Google"

2. **Open Browser Console** (F12 → Console tab)
   - Add a document
   - Look for these messages:
     ```
     [AddDocument] Starting document save...
     [AddDocument] User authenticated: [user-id]
     [AddDocument] Document saved successfully
     ```

3. **If you see "No authenticated user":**
   - Log out and log back in
   - Clear browser cache (Ctrl+Shift+Delete)
   - Try again

4. **If you see database errors:**
   - Check Supabase dashboard
   - Verify RLS policies are enabled
   - Check if documents table exists

5. **Refresh the page** after adding a document
   - Sometimes the UI needs a manual refresh
   - Press F5 or Ctrl+R

---

### Issue 2: No Sound Alerts

**Root Cause:** Browsers block audio until user interacts with the page

**Steps to Fix:**

1. **Click anywhere on the Dashboard**
   - You should see "Audio context unlocked" in console
   - The warning "Click anywhere to enable sound alerts" should disappear

2. **Test the sound:**
   - Add a document with expiry date 10 days from today
   - Wait 2-3 seconds
   - You should hear a 15-second melody

3. **If still no sound:**
   - Check browser console for errors
   - Try a different browser (Chrome works best)
   - Check your computer volume is not muted
   - Check browser permissions (allow audio)

4. **Manual Test:**
   - Open browser console
   - Type: `playAlertSound()`
   - Press Enter
   - You should hear the sound

---

### Issue 3: No Gmail Email Alerts

**Steps to Fix:**

1. **Check Your Profile Email**
   - Go to Profile/Settings page
   - Make sure your email is filled in
   - Save if you made changes

2. **Check Backend Server**
   - Visit: `http://localhost:3000/api/health` (local)
   - Or: `https://your-app.onrender.com/api/health` (deployed)
   - You should see:
     ```json
     {
       "status": "ok",
       "gmailStatus": "connected as your-email@gmail.com"
     }
     ```

3. **If Gmail status shows error:**
   - Check `.env` file has all 4 Gmail variables:
     - `GMAIL_USER`
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `GMAIL_REFRESH_TOKEN`
   - Restart the server: `npm start`

4. **Check Browser Console:**
   - Look for these messages:
     ```
     [Alert] Starting alert check...
     [Alert] Checking "Document Name": X days until expiry
     [Alert] *** 30-DAY TRIGGER for "Document Name" ***
     [Alert] Sending 30-day email...
     [Alert] ✅ 30-day email sent successfully
     ```

5. **If you see "No user email":**
   - Go to Profile page
   - Fill in your email address
   - Save
   - Go back to Dashboard
   - Click "Sync Alerts" button

6. **If email sending fails:**
   - Check the error message in console
   - Common errors:
     - `invalid_client` → Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
     - `invalid_grant` → Refresh token expired, need to regenerate
     - `Network error` → Backend server not running

---

## 🧪 Testing Alerts Step-by-Step

### Test 1: 30-Day Alert (8-30 days)

1. Go to "Add Document" page
2. Fill in:
   - Name: "Test Passport"
   - Category: "Travel"
   - Expiry Date: **10 days from today**
   - Priority: "Important"
3. Click "Save Document"
4. Wait 2-3 seconds
5. **Expected Results:**
   - ✅ Hear 15-second sound
   - ✅ See notification: "30-day alert: Test Passport sent!"
   - ✅ Receive email in Gmail inbox
   - ✅ Document appears in Dashboard
   - ✅ Console shows: "[Alert] ✅ 30-day email sent successfully"

### Test 2: 7-Day Urgent Alert (0-7 days)

1. Go to "Add Document" page
2. Fill in:
   - Name: "Test License"
   - Expiry Date: **5 days from today**
   - Priority: "Critical"
3. Click "Save Document"
4. Wait 2-3 seconds
5. **Expected Results:**
   - ✅ Hear 15-second sound
   - ✅ See notification: "URGENT: Test License alert sent!"
   - ✅ Receive email with "🚨 URGENT" in subject
   - ✅ Document appears in Dashboard with "CRITICAL" badge
   - ✅ Console shows: "[Alert] ✅ 7-day URGENT email sent successfully"

### Test 3: No Alert (Above 30 Days)

1. Add document with expiry date **40 days from today**
2. **Expected Results:**
   - ✅ Document saves successfully
   - ✅ Document appears in Dashboard
   - ❌ NO sound alert
   - ❌ NO email alert
   - ✅ Console shows: "[Alert] is 40 days away - no alert needed (>30 days)"
   - ✅ Google Calendar opens to save the date

---

## 🔍 Debugging Checklist

### Before Adding a Document:

- [ ] Logged in with Google
- [ ] Profile email is set
- [ ] Clicked anywhere on Dashboard (to unlock audio)
- [ ] Browser console is open (F12)
- [ ] Backend server is running (`npm start`)

### After Adding a Document:

- [ ] Check console for "[AddDocument] Document saved successfully"
- [ ] Check console for "[Alert] Starting alert check..."
- [ ] Refresh Dashboard (F5) to see document
- [ ] Check if document appears in "Total Documents" count
- [ ] Check if alert triggered (if within 30 days)

### If Alerts Don't Trigger:

- [ ] Check console for "[Alert] No user email"
- [ ] Check console for "[Alert] Sound blocked"
- [ ] Check console for "[Alert] email failed"
- [ ] Visit `/api/health` to check Gmail status
- [ ] Check spam folder in Gmail
- [ ] Wait 60 seconds (alerts check every minute)
- [ ] Click "Sync Alerts" button manually

---

## 🛠️ Advanced Debugging

### Check Supabase Connection

1. Open browser console
2. Type:
   ```javascript
   supabase.from('documents').select('*').then(console.log)
   ```
3. Press Enter
4. You should see your documents

### Check User Authentication

1. Open browser console
2. Type:
   ```javascript
   supabase.auth.getUser().then(console.log)
   ```
3. You should see your user object with email

### Manually Trigger Alert Check

1. Open browser console
2. Type:
   ```javascript
   refreshAlerts()
   ```
3. Or click the "Sync Alerts" button in Dashboard

### Test Sound Manually

1. Open browser console
2. Type:
   ```javascript
   playAlertSound()
   ```
3. You should hear 15-second melody

### Test Email Manually

1. Open browser console
2. Type:
   ```javascript
   fetch('/api/send-email', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       to: 'your-email@gmail.com',
       subject: 'Test Alert',
       text: 'This is a test'
     })
   }).then(r => r.json()).then(console.log)
   ```
4. Check your Gmail inbox

---

## 🔐 Gmail API Issues

### If Gmail API is not working:

1. **Check Environment Variables:**
   ```bash
   # In .env file
   GMAIL_USER=your-email@gmail.com
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
   GMAIL_REFRESH_TOKEN=1//04xxxxx
   ```

2. **Regenerate Refresh Token:**
   - Go to: https://developers.google.com/oauthplayground
   - Select "Gmail API v1" → "https://mail.google.com/"
   - Click "Authorize APIs"
   - Click "Exchange authorization code for tokens"
   - Copy the "Refresh token"
   - Update `.env` file with new token
   - Restart server

3. **Check Google Cloud Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Make sure Gmail API is enabled
   - Check OAuth consent screen is configured
   - Verify redirect URIs are correct

---

## 📊 Expected Console Output

### When Adding a Document:

```
[AddDocument] Starting document save...
[AddDocument] User authenticated: abc123-def456
[AddDocument] Insert payload: {name: "Test Doc", ...}
[AddDocument] Document saved successfully: {id: "xyz789", ...}
[AddDocument] Updated documents list: 5 documents
[AddDocument] Triggering alert check...
```

### When Alert Triggers:

```
[Alert] Starting alert check...
[Alert] Documents to check: 5
[Alert] User email: your-email@gmail.com
[Alert] Checking "Test Doc": 10 days until expiry
[Alert] *** 30-DAY TRIGGER for "Test Doc" (10 days left) ***
[Alert] Playing 15-second sound...
[Sound] playAlertSound called. Current state: running
[Sound] Melody playing
[Alert] Sending 30-day email...
[Email] Sending request to backend for: Test Doc
[Email] Backend response for "Test Doc": {success: true, messageId: "..."}
[Alert] ✅ 30-day email sent successfully for "Test Doc"
[Alert] Updating database for "Test Doc"...
[Alert] Database updated for "Test Doc"
[Alert] Alert check complete
```

---

## 🎯 Common Error Messages & Solutions

| Error Message | Solution |
|---------------|----------|
| "No authenticated user found!" | Log in with Google |
| "Please set your email in Profile" | Go to Profile page and add email |
| "Sound blocked - user needs to interact" | Click anywhere on the page |
| "Email failed: invalid_client" | Check GOOGLE_CLIENT_ID and SECRET |
| "Email failed: invalid_grant" | Regenerate refresh token |
| "Network error (Check Render Logs)" | Backend server not running |
| "Save failed: permission denied" | Check Supabase RLS policies |

---

## ✅ Success Indicators

You know everything is working when:

- ✅ Documents appear in Dashboard immediately after saving
- ✅ Total Documents count increases
- ✅ 15-second sound plays when adding document within 30 days
- ✅ Email arrives in Gmail inbox within 10 seconds
- ✅ Browser notification appears
- ✅ Console shows success messages
- ✅ `/api/health` shows Gmail connected
- ✅ Document has green "30d Alert" or "7d Alert" badge

---

## 📞 Still Having Issues?

1. **Check all console logs** - They tell you exactly what's happening
2. **Test each component separately** - Sound, email, database
3. **Verify environment variables** - All 7 required variables set
4. **Check Supabase dashboard** - Documents table, RLS policies
5. **Test `/api/health` endpoint** - Gmail connection status
6. **Try in incognito mode** - Rules out browser cache issues
7. **Check spam folder** - Emails might be filtered

---

**Remember:** The console logs are your best friend for debugging! Always check them first.
