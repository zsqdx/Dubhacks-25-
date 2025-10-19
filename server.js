import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { S3Storage, generateId } from './s3Storage.js';
import { OAuth2Client } from 'google-auth-library';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory session storage (for hackathon - use Redis/DynamoDB in production)
const sessions = new Map();

// ===== CANVAS API PROXY =====

app.use('/canvas-api', async (req, res) => {
  const canvasPath = req.path.substring(1);
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  try {
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const canvasUrl = `https://canvas.instructure.com/api/v1/${canvasPath}${queryString}`;

    console.log(`Proxying: ${req.method} ${canvasUrl}`);

    const response = await fetch(canvasUrl, {
      method: req.method,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== GOOGLE AUTH =====

app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    const userId = `google_${googleId}`;
    let profile = await S3Storage.getUserProfile(userId);

    if (!profile) {
      profile = {
        userId,
        email,
        name,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await S3Storage.saveUserProfile(profile);
    } else {
      profile.lastLogin = new Date().toISOString();
      await S3Storage.saveUserProfile(profile);
    }

    const sessionId = generateId();
    sessions.set(sessionId, { userId, email, name });

    res.json({
      success: true,
      sessionId,
      canvasToken: profile.canvasToken || null,
      user: {
        userId,
        email,
        name,
        hasCanvasToken: !!profile.canvasToken,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// ===== CREDENTIALS AUTH =====

app.post('/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one lowercase letter' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one number' });
  }

  try {
    // Check for duplicate email
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    const { S3Client } = await import('@aws-sdk/client-s3');
    const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });

    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME || 'dubhacks25-bucket',
      Prefix: 'users/',
    }));

    // Check if email already exists
    for (const obj of (response.Contents || [])) {
      const key = obj.Key || '';
      if (key.endsWith('/profile.json')) {
        const userId = key.split('/')[1];
        const profile = await S3Storage.getUserProfile(userId);

        if (profile && profile.email.toLowerCase() === email.toLowerCase()) {
          return res.status(400).json({ error: 'An account with this email already exists' });
        }
      }
    }

    const userId = `cred_${generateId()}`;
    const passwordHash = await bcrypt.hash(password, 10);

    await S3Storage.saveContent(userId, 'auth', 'password.txt', passwordHash);

    const profile = {
      userId,
      email,
      name,
      authProvider: 'credentials',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    await S3Storage.saveUserProfile(profile);

    const sessionId = generateId();
    sessions.set(sessionId, { userId, email, name });

    res.json({
      success: true,
      sessionId,
      canvasToken: null,
      user: {
        userId,
        email,
        name,
        hasCanvasToken: false,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // List all objects in users/ prefix to find all user profiles
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    const { S3Client } = await import('@aws-sdk/client-s3');
    const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });

    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME || 'dubhacks25-bucket',
      Prefix: 'users/',
    }));

    let foundUserId = null;
    let foundProfile = null;

    for (const obj of (response.Contents || [])) {
      const key = obj.Key || '';
      if (key.endsWith('/profile.json')) {
        const userId = key.split('/')[1];
        const profile = await S3Storage.getUserProfile(userId);

        if (profile && profile.email === email && profile.authProvider === 'credentials') {
          foundUserId = userId;
          foundProfile = profile;
          break;
        }
      }
    }

    if (!foundUserId || !foundProfile) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordHash = await S3Storage.getContent(foundUserId, 'auth', 'password.txt');
    const isValid = await bcrypt.compare(password, passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    foundProfile.lastLogin = new Date().toISOString();
    await S3Storage.saveUserProfile(foundProfile);

    const sessionId = generateId();
    sessions.set(sessionId, {
      userId: foundUserId,
      email: foundProfile.email,
      name: foundProfile.name,
    });

    res.json({
      success: true,
      sessionId,
      canvasToken: foundProfile.canvasToken || null,
      user: {
        userId: foundUserId,
        email: foundProfile.email,
        name: foundProfile.name,
        hasCanvasToken: !!foundProfile.canvasToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ===== CANVAS TOKEN SETUP =====

app.post('/auth/setup-canvas', async (req, res) => {
  const { sessionId, canvasToken } = req.body;

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  try {
    const canvasResponse = await fetch('https://canvas.instructure.com/api/v1/users/self', {
      headers: {
        'Authorization': `Bearer ${canvasToken}`,
      },
    });

    if (!canvasResponse.ok) {
      return res.status(400).json({ error: 'Invalid Canvas token' });
    }

    const canvasUser = await canvasResponse.json();

    await S3Storage.updateCanvasToken(session.userId, canvasToken, canvasUser.id);

    res.json({
      success: true,
      canvasUser: {
        id: canvasUser.id,
        name: canvasUser.name,
      },
    });
  } catch (error) {
    console.error('Canvas setup error:', error);
    res.status(500).json({ error: 'Failed to setup Canvas' });
  }
});

// ===== SESSION MANAGEMENT =====

app.get('/auth/session', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  res.json({ success: true, user: session });
});

app.post('/auth/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  sessions.delete(sessionId);
  res.json({ success: true });
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log(`\n🚀 SnapSyllabus Server running on http://localhost:${PORT}\n`);
  console.log('Canvas API Proxy:');
  console.log('  → /canvas-api/*\n');
  console.log('Auth Endpoints:');
  console.log('  → POST /auth/google - Google OAuth login');
  console.log('  → POST /auth/signup - Create account');
  console.log('  → POST /auth/login - Login');
  console.log('  → POST /auth/setup-canvas - Setup Canvas token');
  console.log('  → GET /auth/session - Get current session');
  console.log('  → POST /auth/logout - Logout\n');
});
