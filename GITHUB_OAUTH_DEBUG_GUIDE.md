# 🔍 GitHub OAuth Debug Guide

## 🧪 **Testing Steps with Debug Logs:**

### **Step 1: Start the Backend with Debug Logs**
```bash
cd "a:\New project\Version-Control\second-brain-backend"
npm run dev
```
Watch for these logs:
- ✅ "Server running on port 3001"
- 🔍 GitHub connection status logs

### **Step 2: Test GitHub OAuth Flow**

1. **Login to your account** (satyamdiwaker863@gmail.com)
2. **Navigate to GitHub Connection page**
3. **Open browser console** (F12) to see frontend logs
4. **Click "Connect GitHub"**

### **Step 3: Watch Backend Logs**
You should see these logs in order:

```
🔗 GitHub OAuth callback received
Query params: { code: '...', state: '...' }
🔄 Exchanging code for access token...
✅ Access token received
👤 Getting GitHub user information...
✅ GitHub user info received: [your-github-username]
🔐 Checking for existing session...
ℹ️ No existing session found  (or ✅ Found existing user)
🔗 Linking GitHub to existing user... (or 🆕 Creating new GitHub-linked user...)
✅ GitHub linked to existing user
💾 Storing GitHub integration data...
🔄 Redirecting to frontend...
🔗 Redirect URL: http://localhost:5173/auth/success?token=...
```

### **Step 4: Test GitHub Connection Status**
After OAuth completes, test the status endpoint:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/github/status
```

Should return:
```json
{
  "success": true,
  "data": { 
    "connected": true,
    "github_id": "12345678",
    "github_username": "your-github-username"
  },
  "message": "GitHub account connected"
}
```

## 🚨 **Common Issues & Solutions:**

### **Issue 1: No Backend Logs on Callback**
**Problem**: GitHub redirects but no callback logs appear
**Solution**: Check GitHub OAuth App callback URL is set to:
```
http://localhost:3001/api/github/auth/callback
```

### **Issue 2: "No existing session found"**
**Problem**: User session not detected in callback
**Solution**: This is normal if you're not logged in when starting OAuth

### **Issue 3: Frontend Shows "Connected" but No Data**
**Problem**: Status shows connected but repositories don't load
**Solution**: Check `/github/profile` endpoint logs for access token issues

### **Issue 4: Database Errors**
**Problem**: SQL errors in backend logs
**Solution**: Run `npm run db:migrate` to ensure latest schema

## 🔧 **Debug Commands:**

### **Check Backend Health:**
```bash
curl http://localhost:3001/api/github/test
```

### **Check GitHub Status:**
```bash
# Get your auth token from browser localStorage
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/github/status
```

### **Check User Profile:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/auth/me
```

## 📋 **Expected Flow:**

1. **Click Connect GitHub** → Redirect to GitHub ✅
2. **Authorize on GitHub** → Redirect to backend callback ✅
3. **Backend processes** → Updates user database ✅
4. **Redirect to frontend** → `/auth/success` with tokens ✅
5. **Frontend stores tokens** → Redirects to `/github` ✅
6. **GitHub page loads** → Shows connected status ✅
7. **Repositories load** → Shows GitHub repos ✅

## 🎯 **What to Look For:**

- **Backend logs**: Should show complete OAuth processing
- **Frontend console**: Should show successful token storage
- **Database**: User should have github_id and github_username
- **GitHub status**: Should return `connected: true`

**Try the GitHub OAuth flow now and watch the backend logs for detailed debugging information!** 🔍
