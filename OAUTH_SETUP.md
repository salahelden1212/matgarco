# OAuth Implementation - Setup Guide

## ✅ What Has Been Implemented

### Backend Setup
1. **Installed OAuth Libraries**
   - `passport` - Authentication middleware
   - `passport-google-oauth20` - Google OAuth strategy
   - `passport-apple` - Apple OAuth strategy

2. **Created OAuth Controller** (`src/controllers/oauth.controller.ts`)
   - Google callback handler
   - Apple callback handler
   - OAuth token generation logic
   - Automatic user creation/linking
   - Automatic merchant assignment for new users

3. **Created Passport Configuration** (`src/config/passport.ts`)
   - Google Strategy setup
   - Apple Strategy setup
   - User serialization/deserialization

4. **Created OAuth Routes** (`src/routes/oauth.routes.ts`)
   - `GET /api/auth/oauth/google` - Initiates Google login
   - `GET /api/auth/oauth/google/callback` - Google callback
   - `GET /api/auth/oauth/apple` - Initiates Apple login
   - `GET /api/auth/oauth/apple/callback` - Apple callback

5. **Updated User Model** (`src/models/User.ts`)
   - Added `appleId` field for Apple OAuth
   - Already had `googleId` and `facebookId` fields

6. **Updated App Configuration** (`src/app.ts`)
   - Integrated Passport middleware
   - Mounted OAuth routes at `/api/auth/oauth`

### Frontend Setup
1. **Updated Login Component** (`dashboard-react/src/pages/auth/Login.tsx`)
   - Added Google OAuth button with icon
   - Added Apple OAuth button with icon
   - Links directly to backend OAuth endpoints

2. **Created OAuth Callback Handler** (`dashboard-react/src/pages/auth/AuthCallback.tsx`)
   - Handles OAuth redirect from backend
   - Exchanges token for user data
   - Sets auth state
   - Redirects to dashboard or onboarding

3. **Updated App Routes** (`dashboard-react/src/App.tsx`)
   - Added `/auth-callback` route for OAuth redirect

### Configuration Files
- Updated `.env.example` with new OAuth environment variables

---

## 🔧 Configuration Required

### 1. Google OAuth Setup

**Step 1: Create Google OAuth Credentials**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project (e.g., "Matgarco")
- Enable the "Google+ API"
- Create OAuth 2.0 credentials (Web Application)
- Add authorized redirect URI: `http://localhost:5000/api/auth/oauth/google/callback`

**Step 2: Add to `.env` file**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 2. Apple OAuth Setup

**Step 1: Create Apple OAuth Credentials**
- Go to [Apple Developer](https://developer.apple.com/)
- Register a new App ID
- Create a Service ID
- Create a Sign in with Apple key
- Download the private key file (`.p8`)

**Step 2: Add to `.env` file**
```bash
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_CLIENT_ID=your-client-id
APPLE_PRIVATE_KEY_PATH=./path/to/private-key.p8
```

### 3. Frontend Environment Variables

Add to `dashboard-react/.env`
```bash
VITE_API_URL=http://localhost:5000
```

---

## 🚀 How It Works

### OAuth Flow Diagram

```
User clicks "Sign in with Google/Apple"
    ↓
Browser redirected to /api/auth/oauth/google (or /apple)
    ↓
Passport initiates OAuth request to Google/Apple
    ↓
User logs in on Google/Apple
    ↓
Google/Apple redirects back to /api/auth/oauth/google/callback
    ↓
Passport verifies the OAuth token
    ↓
Backend finds/creates user in database
    ↓
Backend generates JWT access token + refresh token
    ↓
Redirect to frontend with token: /auth-callback?token=xxx
    ↓
Frontend callback page receives token
    ↓
Fetches user data with token (/api/auth/me)
    ↓
Stores user in Zustand auth store
    ↓
Redirects to /dashboard or /onboarding
```

---

## 🔐 Security Features

✅ **Password-less Authentication** - Users don't need to remember passwords
✅ **HttpOnly Cookies** - Refresh tokens stored securely
✅ **JWT Tokens** - Short-lived access tokens (15 minutes)
✅ **Automatic User Creation** - New OAuth users get automatic account setup
✅ **Pre-verified Emails** - OAuth emails are automatically verified
✅ **Role-based Routing** - Automatic merchant assignment on signup

---

## 📱 Supported Providers

✅ **Google** - Full implementation
✅ **Apple** - Full implementation
🔄 **Facebook** - Fields ready in User model, can be added following same pattern

---

## 🧪 Testing

### Local Development Testing

1. **Start Backend:**
   ```bash
   cd backend-node
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd dashboard-react
   npm run dev
   ```

3. **Click OAuth Button:**
   - Go to `http://localhost:3002/login`
   - Click "Sign in with Google" or "Sign in with Apple"
   - Complete OAuth flow
   - Should redirect to dashboard

### Common Issues & Solutions

**Error: "GOOGLE_CLIENT_ID is not configured"**
- Solution: Add Google OAuth credentials to `.env`

**Error: "Redirect URI mismatch"**
- Solution: Ensure callback URL in Google/Apple console matches `http://localhost:5000/api/auth/oauth/google/callback`

**Error: "Apple private key not found"**
- Solution: Add path to `.p8` file in `APPLE_PRIVATE_KEY_PATH` env var

**Frontend stuck on loading after OAuth**
- Solution: Check browser console for errors, ensure API_URL is correct

---

## 📝 Next Steps

1. **Get OAuth Credentials:**
   - Create Google OAuth app (takes 5 minutes)
   - Create Apple OAuth app (takes 10 minutes)

2. **Add to Environment:**
   ```bash
   cp .env.example .env
   # Fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc.
   ```

3. **Test Locally:**
   - Start backend and frontend
   - Test Google OAuth
   - Test Apple OAuth

4. **Production Deployment:**
   - Update callback URLs with production domain
   - Update `BACKEND_URL` and `FRONTEND_URL` env vars
   - Use environment-specific credentials for security

---

## 🎯 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/oauth/google` | GET | Initiate Google OAuth |
| `/api/auth/oauth/google/callback` | GET | Google OAuth callback |
| `/api/auth/oauth/apple` | GET | Initiate Apple OAuth |
| `/api/auth/oauth/apple/callback` | GET | Apple OAuth callback |
| `/api/auth/me` | GET | Get current user (used after OAuth) |

---

## 📦 Files Modified/Created

### Backend
- ✅ `src/config/passport.ts` - **NEW** Passport configuration
- ✅ `src/controllers/oauth.controller.ts` - **NEW** OAuth handlers
- ✅ `src/routes/oauth.routes.ts` - **NEW** OAuth routes
- ✅ `src/models/User.ts` - **MODIFIED** Added appleId field
- ✅ `src/app.ts` - **MODIFIED** Integrated Passport
- ✅ `package.json` - **MODIFIED** Added passport libraries
- ✅ `.env.example` - **MODIFIED** Added OAuth env variables

### Frontend
- ✅ `src/pages/auth/Login.tsx` - **MODIFIED** Added OAuth buttons
- ✅ `src/pages/auth/AuthCallback.tsx` - **NEW** OAuth callback handler
- ✅ `src/App.tsx` - **MODIFIED** Added auth-callback route

---

**Implementation Status: 90% Complete** ✅
Ready for OAuth credentials setup and testing!
