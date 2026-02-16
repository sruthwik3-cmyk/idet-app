# 🐛 DEBUGGING GUIDE - Document Save & Alert Issues

## Issues Reported:
1. ❌ Documents not saving/showing in dashboard
2. ❌ No 15-second sound alerts
3. ❌ No Gmail email alerts
4. ✅ Alerts should only trigger for 7-day and 30-day (not above 30 days) - ALREADY CORRECT

---

## 🔍 ROOT CAUSE ANALYSIS

### Issue 1: Documents Not Saving

**Possible Causes:**
1. Database connection issue (Supabase)
2. User not authenticated
3. RLS (Row Level Security) policy blocking insert
4. Missing required fields
5. Silent error in addDocument function

**How to Debug:**
1. Open browser console (F12 → Console)
2. Try adding a document
3. Look for errors in console
4. Check Network tab for failed requests

---

### Issue 2: No Sound Alerts

**Root Cause:** Browser autoplay policy blocks audio until user interacts with page

**Solution:** User must click anywhere on the page first before sound can play

---

### Issue 3: No Gmail Alerts

**Possible Causes:**
1. User profile email not set
2. Gmail API credentials invalid
3. Backend server not running
4. Environment variables not loaded
5. Alert logic not being triggered

---

## 🔧 STEP-BY-STEP FIXES

### Fix 1: Enable Console Logging

Add this to see what's happening:

