# Authentication & Storage Setup Guide

Complete setup guide for Google OAuth2, credential auth, and AWS S3 storage.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Google OAuth2 (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Authorized JavaScript origins:
   ```
   http://localhost:5173
   ```
7. Copy the Client ID

### 3. Set Up AWS S3

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create S3 bucket: `snapsyllabus-content`
3. Go to IAM → Users → Create User
4. Attach policy: `AmazonS3FullAccess`
5. Create access key → Download credentials

### 4. Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```
# Google OAuth2
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id

# AWS S3
AWS_REGION=us-east-1
S3_BUCKET_NAME=snapsyllabus-content
AWS_ACCESS_KEY_ID=your_actual_aws_key
AWS_SECRET_ACCESS_KEY=your_actual_aws_secret
```

### 5. Run the App

You need **3 terminals**:

```bash
# Terminal 1: Vite dev server
npm run dev

# Terminal 2: Canvas API proxy
npm run proxy

# Terminal 3: Auth server
npm run auth
```

Then open: http://localhost:5173/

## Authentication Flow

### User Journey:

1. **Step 1: Auth**
   - User sees login page
   - Options: Google OAuth OR email/password
   - Creates account or logs in

2. **Step 2: Canvas Setup**
   - After auth, prompted for Canvas token
   - Goes to canvas.instructure.com/profile/settings
   - Generates token, pastes it
   - Can skip (limited features)

3. **Step 3: Main App**
   - Fully authenticated
   - Canvas courses load automatically
   - AI features enabled

### What Gets Stored in S3:

```
s3://snapsyllabus-content/
  └── users/
      └── {userId}/
          ├── profile.json          # User profile + Canvas token
          ├── worksheets/
          │   ├── worksheet_1.json
          │   └── worksheet_2.json
          ├── schedules/
          │   └── schedule_week1.json
          └── auth/
              └── password.txt      # Hashed password (credentials only)
```

## API Endpoints

### Auth Server (Port 3002)

**Google OAuth:**
```
POST /auth/google
Body: { credential: "google_jwt_token" }
Response: { success: true, sessionId, user }
```

**Sign Up:**
```
POST /auth/signup
Body: { email, password, name }
Response: { success: true, sessionId, user }
```

**Log In:**
```
POST /auth/login
Body: { email, password }
Response: { success: true, sessionId, user }
```

**Setup Canvas:**
```
POST /auth/setup-canvas
Body: { sessionId, canvasToken }
Response: { success: true, canvasUser }
```

**Get Session:**
```
GET /auth/session
Headers: Authorization: Bearer {sessionId}
Response: { success: true, user }
```

**Logout:**
```
POST /auth/logout
Headers: Authorization: Bearer {sessionId}
Response: { success: true }
```

## Using S3 Storage in Your Code

```typescript
import { S3Storage } from './s3Storage';

// Save user profile
await S3Storage.saveUserProfile({
  userId: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
  authProvider: 'google',
  canvasToken: 'token_here',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
});

// Get user profile
const profile = await S3Storage.getUserProfile('user_123');

// Save AI-generated worksheet
await S3Storage.saveWorksheet({
  id: 'worksheet_456',
  userId: 'user_123',
  courseId: 12345,
  courseName: 'Calculus I',
  topic: 'Integration',
  content: aiGeneratedContent,
  createdAt: new Date().toISOString(),
});

// List all user's worksheets
const worksheets = await S3Storage.listUserWorksheets('user_123');

// Save any custom content
await S3Storage.saveContent('user_123', 'chat-history', 'session_789.json', chatData);
```

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `.env`** - It contains secrets
2. **Sessions are in-memory** - For hackathon only! Use Redis/DynamoDB in production
3. **Passwords are hashed** - Using bcrypt with 10 rounds
4. **Canvas tokens stored in S3** - Encrypted at rest by AWS
5. **HTTPS required in production** - Current setup is HTTP (dev only)

## Troubleshooting

### "Google sign in failed"
- Check GOOGLE_CLIENT_ID in `.env`
- Verify `http://localhost:5173` is in authorized origins

### "Failed to connect to auth server"
- Make sure `npm run auth` is running
- Check port 3002 is not in use

### "S3 access denied"
- Verify AWS credentials in `.env`
- Check IAM user has S3 permissions
- Confirm bucket name matches

### "Invalid Canvas token"
- Token may have expired
- Generate new token in Canvas settings
- Ensure no extra spaces when pasting

## For Production

**TODO before deploying:**

1. Replace in-memory sessions with Redis/DynamoDB
2. Add email verification
3. Implement password reset
4. Use HTTPS everywhere
5. Add rate limiting
6. Implement refresh tokens
7. Add CSRF protection
8. Sanitize all inputs
9. Add proper error logging
10. Use environment-specific configs

## Cost Estimate

**For Hackathon (48 hours):**
- S3: $0.00 (under free tier)
- No other AWS costs

**For Production (monthly):**
- S3: ~$1-5 depending on usage
- DynamoDB (if used): ~$0-5 with free tier
- Total: ~$5-10/month for small scale

## Summary

✅ Google OAuth OR email/password
✅ Canvas token setup after auth
✅ All data stored per-user in S3
✅ Session management
✅ Ready for AI integration

You're all set! Users can now sign in, connect Canvas, and start using AI features!
