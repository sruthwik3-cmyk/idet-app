# 🔐 Fix GitHub Authentication

Your GitHub credentials have expired. Here's how to fix it:

## Quick Fix (Recommended)

### Option 1: Use GitHub Desktop (Easiest)
1. Open **GitHub Desktop**
2. Go to **File** → **Options** → **Accounts**
3. Click **Sign in** to GitHub.com
4. Complete the authentication
5. Then push from GitHub Desktop or terminal

### Option 2: Create Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `IDET App`
4. Select scopes: ✅ **repo** (all checkboxes under repo)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)

### Option 3: Use the Token
Run these commands:

```bash
# Remove old credentials
git config --global --unset credential.helper

# Set up credential manager
git config --global credential.helper manager-core

# Try pushing again (it will ask for credentials)
git push origin main
```

When prompted:
- **Username**: `sruthwik3-cmyk`
- **Password**: Paste your Personal Access Token (not your GitHub password!)

---

## Alternative: Push from GitHub Desktop

If you have GitHub Desktop installed:
1. Open GitHub Desktop
2. It should show your changes
3. Click **"Push origin"** button
4. It will handle authentication automatically

---

## Your Beautiful Logo is Ready! 🎨

Once you push successfully, your stunning new logo will be deployed with:
- ✨ Vibrant purple-pink gradients
- 📄 Document tracking icon
- 📅 Calendar with expiry dates
- 🔔 Alert bell with notifications
- ⏰ Time tracking clock
- ✨ Sparkle effects

The logo is already committed locally, just needs to be pushed to GitHub!
