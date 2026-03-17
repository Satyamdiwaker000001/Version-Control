# GitHub OAuth Debugging Guide

## Issue: GitHub Connection Not Working

### ✅ What's Working:
- Backend server is running on port 3001
- Frontend server is running on port 5173
- API endpoint `/api/github/auth/url` is accessible and returns correct OAuth URL
- CORS is properly configured

### 🔍 Most Likely Issues:

#### 1. GitHub OAuth App Configuration
**Check these settings in your GitHub OAuth App:**
- **Callback URL**: Must be exactly `http://localhost:3001/api/github/auth/callback`
- **Homepage URL**: Can be `http://localhost:5173`
- **Client ID**: Should match `Ov23liwzls5dxhrKAvlt`
- **Client Secret**: Should match the one in your .env file

#### 2. Frontend API Configuration
The frontend should be calling: `http://localhost:3001/api/github/auth/url`

#### 3. Browser Console Errors
Open browser dev tools and check for:
- CORS errors
- Network request failures
- JavaScript errors

### 🛠️ Debugging Steps:

1. **Test the API directly:**
   ```bash
   curl http://localhost:3001/api/github/auth/url
   ```

2. **Open the test page:**
   Open `test-github-oauth.html` in your browser to test the OAuth flow

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to Network tab
   - Click "Connect GitHub" button
   - Look for the request to `/api/github/auth/url`

4. **Verify GitHub OAuth App:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Check your app settings match the configuration above

### 📋 Expected Flow:
1. User clicks "Connect GitHub"
2. Frontend calls `/api/github/auth/url`
3. Backend returns GitHub OAuth URL
4. User is redirected to GitHub
5. User authorizes the app
6. GitHub redirects to `http://localhost:3001/api/github/auth/callback`
7. Backend processes the callback and creates/updates user account
8. User is redirected back to frontend with tokens

### 🚨 If Still Not Working:
- Check if GitHub OAuth app is in "Production" mode (should be in development for localhost)
- Verify the callback URL exactly matches (no trailing slashes)
- Check if any browser extensions are blocking the request
- Try in incognito mode
