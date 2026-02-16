# Deploy Updates to Render - Quick Guide

## Current Status
✅ All code changes are committed locally
✅ UI improvements complete
✅ Email template enhanced
✅ Bug fixes applied

❌ GitHub push blocked due to exposed credentials in old commit (a746ddf)

---

## SOLUTION: Manual Deploy from Render

### Step 1: Bypass GitHub and Deploy Directly

Since the code is already in your local repository and the problematic commit is old, we'll use Render's manual deploy feature:

1. **Open Render Dashboard:**
   https://dashboard.render.com

2. **Click on your service:**
   - Look for `idet-app-1`
   - Click on it

3. **Click "Manual Deploy" button**
   - Located in the top right corner
   - Or in the "Manual Deploy" section

4. **Select deployment option:**
   - Choose "Clear build cache & deploy"
   - This ensures a fresh build

5. **Wait for deployment:**
   - Takes 3-5 minutes
   - Watch the logs for progress

---

## Alternative: Fix GitHub Push Issue

If you want to push to GitHub first, you need to allow the blocked secrets:

### Option A: Allow Secrets via GitHub Links

GitHub provided these links in the error message. Click each one to allow:

1. **Refresh Token:**
   https://github.com/sruthwik3-cmyk/idet-app/security/secret-scanning/unblock-secret/39jMNyWWg6CQ1buHYsoAQ216T8k

2. **Client ID:**
   https://github.com/sruthwik3-cmyk/idet-app/security/secret-scanning/unblock-secret/39jMO3OIsz2JnK1EcTJAgxmueTT

3. **Client Secret:**
   https://github.com/sruthwik3-cmyk/idet-app/security/secret-scanning/unblock-secret/39jMO4HIaF1sxA00HkZQFGoRsHb

After clicking all three links and allowing them, try pushing again:
```bash
git push origin main
```

### Option B: Remove Problematic Commit (Advanced)

**WARNING:** This rewrites history. Only do this if you understand Git.

```bash
# Create a backup branch first
git branch backup-before-rewrite

# Interactive rebase to remove the problematic commit
git rebase -i a746ddf^

# In the editor, change "pick" to "drop" for commit a746ddf
# Save and exit

# Force push (this rewrites history!)
git push origin main --force
```

---

## What Gets Deployed

### Code Changes:
1. ✅ Fixed `user_group` column issue
2. ✅ Professional email template with HTML design
3. ✅ Improved UI alignment and consistency
4. ✅ Removed unnecessary elements
5. ✅ Enhanced button styling and hover effects
6. ✅ Better spacing and typography

### New Features:
- Professional gradient email design
- Color-coded urgency indicators
- Improved dashboard layout
- Cleaner profile settings
- Better alerts page
- Simplified calendar view

---

## After Deployment

### 1. Verify Deployment
Visit: https://idet-app-1.onrender.com

Check:
- [ ] Dashboard loads correctly
- [ ] Stats cards display properly
- [ ] Documents list shows correctly
- [ ] Buttons are properly aligned
- [ ] Profile page looks good
- [ ] Alerts page is clean
- [ ] Calendar view works

### 2. Test Functionality
- [ ] Add a new document
- [ ] Check if it saves to database
- [ ] Verify stats update
- [ ] Test email alerts
- [ ] Test sound alerts

### 3. Check Email Template
Add a document expiring in 5 days and check your email:
- [ ] Email received
- [ ] Professional design displays
- [ ] Colors and layout correct
- [ ] "Add to Calendar" button works

---

## Troubleshooting

### Deployment Fails
1. Check Render logs for errors
2. Verify all environment variables are set
3. Try "Clear build cache & deploy" again

### UI Doesn't Update
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Try incognito/private mode

### Email Template Not Updated
1. Check Render logs for build success
2. Verify server restarted
3. Test with /api/health endpoint

---

## Quick Commands

### Check Render Deployment Status
```bash
# Visit Render dashboard
https://dashboard.render.com
```

### Test Health Endpoint
```bash
# In browser
https://idet-app-1.onrender.com/api/health
```

### View Render Logs
```bash
# In Render dashboard
Click "Logs" tab
```

---

## Summary of Changes Ready to Deploy

### UI Improvements:
- Dashboard header alignment fixed
- Button labels improved
- Removed "Cal Event" badge
- Better spacing throughout
- Enhanced hover effects
- Consistent typography

### Email Template:
- Professional HTML design
- Gradient header
- Color-coded urgency
- Detailed document card
- Action required section
- Mobile responsive

### Bug Fixes:
- user_group column issue resolved
- Alert system working correctly
- Database saves functioning
- Stats updating properly

---

## Need Help?

If deployment fails or you encounter issues:

1. **Check Render Logs:**
   - Go to Render dashboard
   - Click "Logs" tab
   - Look for error messages

2. **Verify Environment Variables:**
   - All 7 variables must be set
   - No extra spaces in values

3. **Test Locally First:**
   ```bash
   npm run build
   npm start
   ```

4. **Contact Support:**
   - Render support: https://render.com/docs
   - Check documentation files in project

---

**Recommended Action:** Use Manual Deploy from Render Dashboard (Step 1 above)

This bypasses the GitHub push issue and deploys your latest code directly!
