# ⚡ QUICK DEPLOY REFERENCE

## 🚀 Your Code is Ready - Deploy Now!

---

## 📋 RENDER SETTINGS (Copy-Paste Ready)

### Build Configuration
```
Name: idet-app
Branch: main
Build Command: npm install && npm run build
Start Command: node server.js
```

### Environment Variables (7 Required)

```env
NODE_VERSION=20

VITE_SUPABASE_URL=https://egnajcexpflszsgjarzt.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbmFqY2V4cGZsc3pzZ2phcnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODMyNTYsImV4cCI6MjA4NjA1OTI1Nn0.72fP2YWQ-UA2d0FozeJu0EqmP6wTr2Ro-0gZXQ7JmRw

GMAIL_USER=sriperambudururuthwik@gmail.com

GOOGLE_CLIENT_ID=[Copy from .env file]

GOOGLE_CLIENT_SECRET=[Copy from .env file]

GMAIL_REFRESH_TOKEN=[Copy from .env file]
```

---

## 🔗 QUICK LINKS

| Service | URL |
|---------|-----|
| **Render Dashboard** | https://dashboard.render.com |
| **Google Cloud Console** | https://console.cloud.google.com/apis/credentials |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/egnajcexpflszsgjarzt |

---

## ✅ POST-DEPLOY CHECKLIST

After deployment, update these:

### Google Cloud Console
- [ ] Add Render URL to Authorized JavaScript origins
- [ ] Add Render URL to Authorized redirect URIs
- [ ] Add Render URL + `/dashboard` to redirect URIs

### Supabase
- [ ] Update Site URL to Render URL
- [ ] Add Render URL + `/**` to Redirect URLs

---

## 🧪 QUICK TESTS

1. **Health Check**: `https://your-app.onrender.com/api/health`
2. **Homepage**: `https://your-app.onrender.com`
3. **Login**: Click "Login with Google"
4. **Alert Test**: Add document with 10-day expiry

---

## 🎯 SUCCESS INDICATORS

- ✅ `/api/health` shows Gmail connected
- ✅ Login works
- ✅ 15-second sound plays
- ✅ Email arrives in Gmail
- ✅ Alerts work for all priorities

---

**Full Guide**: See `RENDER_DEPLOYMENT_GUIDE.md`
