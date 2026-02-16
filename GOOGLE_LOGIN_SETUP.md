# 🔐 Google Login Setup Guide

## ✅ Code is Ready!
All code is already implemented. You just need to configure Google and Supabase.

---

## 📋 Step 1: Get Your Supabase Project URL

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Find **Project URL**
   - It looks like: `https://xxxxxxxxxxxxx.supabase.co`
   - Copy the part before `.supabase.co` (your project reference)
   - Example: If URL is `https://abcdefghijk.supabase.co`, copy `abcdefghijk`

**Save this!** You'll need it in Step 2.

---

## 📋 Step 2: Create Google OAuth Credentials

### 2.1 Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Create a new project (or select existing one):
   - Click project dropdown at the top
   - Click **New Project**
   - Name: `올영 TOP 100`
   - Click **Create**

### 2.2 Configure OAuth Consent Screen (First Time Only)
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External**
3. Click **Create**
4. Fill in required fields:
   - **App name**: `올영 TOP 100`
   - **User support email**: Your Gmail address
   - **App logo**: (optional, skip for now)
   - **App domain**: (optional, skip for now)
   - **Developer contact**: Your Gmail address
5. Click **Save and Continue**
6. **Scopes**: Click **Save and Continue** (don't add any)
7. **Test users**: Click **Save and Continue** (don't add any)
8. Click **Back to Dashboard**

### 2.3 Create OAuth Client ID
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type**: Web application
4. **Name**: `올영 TOP 100 - Web Client`
5. **Authorized JavaScript origins**: Click **+ ADD URI**
   ```
   http://localhost:5174
   ```
   Add another one:
   ```
   http://localhost:3001
   ```

6. **Authorized redirect URIs**: Click **+ ADD URI**
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   ⚠️ **IMPORTANT**: Replace `YOUR-PROJECT-REF` with your actual Supabase project reference from Step 1!

   Example: If your project ref is `abcdefghijk`, use:
   ```
   https://abcdefghijk.supabase.co/auth/v1/callback
   ```

7. Click **CREATE**

8. **COPY THESE VALUES** (you'll need them in Step 3):
   - ✅ Client ID (looks like: `123456789-xxxxx.apps.googleusercontent.com`)
   - ✅ Client secret (looks like: `GOCSPX-xxxxxxxxxxxxx`)

---

## 📋 Step 3: Configure Supabase

### 3.1 Enable Google Provider
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers**
4. Scroll down and find **Google**
5. Toggle the switch to **ENABLED** (green)
6. Paste your **Client ID** from Step 2
7. Paste your **Client Secret** from Step 2
8. Click **Save**

### 3.2 Configure Site URL and Redirect URLs
1. Still in **Authentication** section
2. Go to **URL Configuration** tab
3. Set **Site URL** to:
   ```
   http://localhost:5174
   ```

4. In **Redirect URLs** section, add these URLs (one per line):
   ```
   http://localhost:5174
   http://localhost:5174/auth/callback
   http://localhost:5174/**
   ```

5. Click **Save**

---

## 📋 Step 4: Test Google Login

### 4.1 Restart Backend (if running)
```bash
# Backend should auto-restart with nodemon
# But if not, press Ctrl+C and restart:
npm run dev
```

### 4.2 Test Flow
1. Open browser: http://localhost:5174
2. Click **로그인** button
3. Click **Google로 계속하기** button
4. You should be redirected to Google login
5. Select your Google account
6. Grant permissions
7. You should be redirected back to your app (logged in!)

### 4.3 Check if it worked
- ✅ Your name/email should appear in header
- ✅ You should be able to add items to cart
- ✅ Open browser console (F12), should see no errors

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Problem**: The redirect URI doesn't match what you configured in Google Cloud Console.

**Solution**:
1. Check backend logs for the actual redirect URI being used
2. Make sure it EXACTLY matches what's in Google Cloud Console
3. Format must be: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
4. No trailing slash, no extra characters

### Error: "Connection refused"
**Problem**: Backend server not running.

**Solution**:
```bash
cd /Users/jasonkim/Desktop/claude\ 0214/claudeolive
npm run dev
```

### Google login button does nothing
**Problem**: Backend not configured correctly.

**Solution**:
1. Check backend logs: `tail -100 /tmp/backend.log`
2. Make sure Supabase environment variables are set in `.env`
3. Restart backend server

### Logged in but cart doesn't work
**Problem**: User not synced to database.

**Solution**:
1. Make sure you ran `FIX_DATABASE_NOW.sql` in Supabase
2. Check backend logs for "Google user synced to public DB"
3. If not synced, logout and login again

---

## 📝 Environment Variables Check

Make sure your `.env` file has these:

```env
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

To find these:
1. Go to Supabase Dashboard → Settings → API
2. Copy **Project URL** → `SUPABASE_URL`
3. Copy **anon public** key → `SUPABASE_ANON_KEY`
4. Copy **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Success Checklist

- [ ] Got Supabase project reference
- [ ] Created Google OAuth client
- [ ] Copied Client ID and Client Secret
- [ ] Enabled Google in Supabase
- [ ] Configured redirect URLs in Supabase
- [ ] Tested login flow
- [ ] Can add items to cart after login

---

## 🎯 What I Already Fixed in Code

✅ Backend Google OAuth route (`/api/auth/google`)
✅ Backend callback handler (`/api/auth/google/callback`)
✅ Frontend Google button in AuthModal
✅ Frontend AuthCallbackPage for OAuth handling
✅ User database sync on Google login
✅ Error handling and logging

**You only need to configure Google and Supabase!**
