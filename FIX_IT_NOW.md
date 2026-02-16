# Fix Your IDET App - Simple Steps

## The Problem
- Documents not saving to dashboard
- Stats showing 0
- No alerts (sound or email)

## The Solution (5 Minutes)

### Step 1: Test What's Broken (2 minutes)

1. **Open the test page:**
   - Find `test-deployment.html` in your project folder
   - Double-click to open in browser
   - It will automatically run tests

2. **Note which tests FAIL:**
   - ❌ Server Health Check
   - ❌ Gmail API Connection
   - ❌ Supabase Connection
   - ❌ Send Test Email
   - ❌ Sound Alert

### Step 2: Fix Supabase (Most Likely Issue) (3 minutes)

**This is probably why documents aren't saving!**

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/egnajcexpflszsgjarzt/sql/new

2. **Copy and paste this SQL:**
   ```sql
   -- Enable RLS
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   
   -- Allow users to manage their documents
   CREATE POLICY "Users can insert own documents"
   ON documents FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can read own documents"
   ON documents FOR SELECT
   TO authenticated
   USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own documents"
   ON documents FOR UPDATE
   TO authenticated
   USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own documents"
   ON documents FOR DELETE
   TO authenticated
   USING (auth.uid() = user_id);
   ```

3. **Click "Run"**

4. **If you see "already exists" errors, that's OK!**

### Step 3: Test Your App

1. **Go to your app:**
   https://idet-app-1.onrender.com

2. **Log in with Google**

3. **Add a test document:**
   - Name: "Test Passport"
   - Category: "Personal"
   - Expiry Date: **5 days from today** (important!)
   - Priority: "Critical"
   - Click "Save"

4. **What should happen:**
   - ✅ Document appears in Dashboard
   - ✅ "Total Documents" shows 1
   - ✅ You hear 15-second sound
   - ✅ You receive email at sriperambudururuthwik@gmail.com

### Step 4: If Still Not Working

**Open browser console (F12) and look for errors:**

#### Error: "column user_group does not exist"
**Fix:** Run this in Supabase SQL Editor:
```sql
ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_group TEXT DEFAULT 'Self';
```

#### Error: "No authenticated user found"
**Fix:** 
- Log out and log back in
- Clear browser cache (Ctrl+Shift+Delete)

#### Error: "Gmail API error" or "invalid_grant"
**Fix:**
1. Check Render environment variables
2. Make sure no extra spaces in values
3. Verify all 7 variables are set

#### No sound playing
**Fix:**
- Click anywhere on the page first
- Browsers block audio until user interaction

#### No email received
**Fix:**
1. Check spam folder
2. Test health endpoint: https://idet-app-1.onrender.com/api/health
3. Should show: "gmailStatus": "connected as your-email"
4. If error, check Render environment variables

---

## Quick Checklist

Before asking for help, verify:

- [ ] Ran SQL commands in Supabase
- [ ] Logged in to app with Google
- [ ] Added document with expiry date 5 days from today
- [ ] Clicked somewhere on page (to enable sound)
- [ ] Checked browser console (F12) for errors
- [ ] Checked spam folder for emails
- [ ] Tested health endpoint shows "connected"

---

## Still Stuck?

Send me:
1. Screenshot of browser console (F12 > Console tab)
2. Screenshot of test-deployment.html results
3. What you see at: https://idet-app-1.onrender.com/api/health

---

## Most Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Documents not saving | Run Supabase SQL commands (Step 2) |
| Stats showing 0 | Same as above - RLS policies |
| No sound | Click page first, then try again |
| No email | Check /api/health endpoint |
| "user_group" error | Run: `ALTER TABLE documents ADD COLUMN user_group TEXT;` |
| Can't log in | Update Google Cloud Console with Render URL |

---

## The #1 Most Likely Problem

**Supabase RLS (Row Level Security) is blocking document saves.**

This is why:
- Documents don't appear in dashboard
- Stats show 0
- Everything else works but data doesn't save

**The fix:** Run the SQL commands in Step 2 above.

After that, 95% chance everything will work!
