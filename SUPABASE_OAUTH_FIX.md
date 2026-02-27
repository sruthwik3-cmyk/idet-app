# 🔧 Supabase Google OAuth Timeout Fix

## Problem
"Continue with Google" button times out and shows "egnajcexpflszsgjarzt.supabase.co took too long to respond"

## Root Causes
1. Supabase free tier cold start (10-20 seconds)
2. Google OAuth might not be properly configured in Supabase
3. Redirect URL mismatch

## Solutions

### Solution 1: Use Email/Password Login (Immediate)
✅ **Recommended for now**
- Use the email/password form on login page
- Faster and more reliable
- No dependency on Supabase OAuth

### Solution 2: Wait and Retry Google Login
- First attempt: Will timeout (Supabase waking up)
- Wait 30 seconds
- Second attempt: Should work (Supabase is awake)

### Solution 3: Check Supabase OAuth Configuration

Go to Supabase Dashboard and verify:

1. **Go to**: https://supabase.com/dashboard
2. **Select**: Your project (egnajcexpflszsgjarzt)
3. **Click**: Authentication → Providers
4. **Find**: Google provider
5. **Verify**:
   - ✅ Google OAuth is enabled
   - ✅ Client ID matches your Google Cloud project
   - ✅ Client Secret is correct
   - ✅ Authorized redirect URIs include:
     - `https://egnajcexpflszsgjarzt.supabase.co/auth/v1/callback`
     - `https://idet-app.onrender.com`
     - `http://localhost:5173` (for local dev)

### Solution 4: Check Google Cloud Console

Verify OAuth settings in Google Cloud:

1. **Go to**: https://console.cloud.google.com
2. **Select**: Your project
3. **Navigate**: APIs & Services → Credentials
4. **Find**: Your OAuth 2.0 Client ID
5. **Verify Authorized redirect URIs**:
   - `https://egnajcexpflszsgjarzt.supabase.co/auth/v1/callback`
   - `https://idet-app.onrender.com`

## Immediate Workaround

**Use email/password login for now:**
1. On login page, use the email/password form
2. If you don't have a password, click "Sign Up"
3. Create account with email and password
4. This bypasses the Google OAuth timeout issue

## Long-term Fix

Once Supabase "warms up" (after first successful request), Google login will work faster. The timeout only happens on cold starts.

**Recommendation**: Use email/password login for reliable access, and Google login as optional convenience once Supabase is warm.
