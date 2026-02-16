# 🚀 START HERE - Fix Your IDET App

## Your Issue
Documents not saving, stats showing 0, no alerts working.

## The Most Likely Cause
**Supabase Row Level Security (RLS) policies are blocking database access.**

This is a security feature that prevents unauthorized access, but it also blocks YOUR access if not configured correctly.

---

## Quick Fix (3 Minutes)

### 1. Open Supabase SQL Editor
**Link:** https://supabase.com/dashboard/project/egnajcexpflszsgjarzt/sql/new

### 2. Copy & Paste This SQL
```sql
-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their documents
CREATE POLICY "Users can insert own documents"
ON documents FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own documents"
ON documents FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
ON documents FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON documents FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

### 3. Click "Run"
If you see "already exists" errors, that's fine - it means policies are already there.

### 4. Test Your App
1. Go to: https://idet-app-1.onrender.com
2. Log in with Google
3. Add a document with expiry date **5 days from today**
4. Check if it appears in Dashboard
5. Check if you hear sound and receive email

---

## If That Didn't Work

### Option A: Use the Test Page
1. Open `test-deployment.html` in your browser
2. It will show you exactly what's broken
3. Follow the specific fix for the failing test

### Option B: Check Browser Console
1. Press F12 in your browser
2. Go to Console tab
3. Try adding a document
4. Look for red error messages
5. Send me a screenshot of the errors

### Option C: Check Render Logs
1. Go to: https://dashboard.render.com
2. Click on "idet-app-1"
3. Click "Logs" tab
4. Look for errors
5. Send me the last 20 lines

---

## Files I Created to Help You

| File | Purpose |
|------|---------|
| `FIX_IT_NOW.md` | Simple step-by-step fix guide |
| `test-deployment.html` | Automated testing tool (open in browser) |
| `TROUBLESHOOTING_COMPLETE.md` | Detailed troubleshooting for all issues |
| `SUPABASE_FIX_COMMANDS.sql` | All SQL commands you might need |
| `POST_DEPLOYMENT_SETUP.md` | Google Cloud & Supabase configuration |

---

## What Should Work After Fix

✅ Documents save to database
✅ Dashboard shows correct stats (Total, Active, Expiring Soon, Expired)
✅ Documents appear in list
✅ 15-second sound alert plays for documents expiring in 0-30 days
✅ Gmail email sent for 30-day alert (8-30 days before expiry)
✅ Gmail email sent for 7-day alert (0-7 days before expiry)
✅ No alerts for documents >30 days away

---

## Alert System Rules

- **30-day alert:** Documents expiring in 8-30 days
- **7-day alert:** Documents expiring in 0-7 days (including today)
- **No alerts:** Documents >30 days away
- **Sound:** 15 seconds (5 loops of melody)
- **Email:** Real Gmail via Gmail API
- **Priority:** Works for ALL priorities (Critical, Important, Optional)

---

## Test Document to Add

To test alerts, add a document with these details:
- **Name:** Test Passport
- **Category:** Personal
- **Expiry Date:** 5 days from today (this triggers 7-day alert)
- **Priority:** Critical

You should immediately:
1. Hear 15-second sound
2. Receive email at sriperambudururuthwik@gmail.com
3. See document in Dashboard
4. See "Total Documents: 1"

---

## Quick Links

| What | Link |
|------|------|
| **Your App** | https://idet-app-1.onrender.com |
| **Health Check** | https://idet-app-1.onrender.com/api/health |
| **Supabase SQL** | https://supabase.com/dashboard/project/egnajcexpflszsgjarzt/sql/new |
| **Render Dashboard** | https://dashboard.render.com |
| **Google Cloud** | https://console.cloud.google.com/apis/credentials |

---

## Need More Help?

Send me:
1. Screenshot of browser console (F12 > Console)
2. Result from: https://idet-app-1.onrender.com/api/health
3. Screenshot of `test-deployment.html` results

---

## 90% Chance This Is Your Issue

**Supabase RLS policies blocking database access.**

Run the SQL commands above and it should work!
