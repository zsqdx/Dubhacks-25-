import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { S3Storage, generateId } from './s3Storage.js';
import { OAuth2Client } from 'google-auth-library';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@smithy/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { HttpRequest } from '@smithy/protocol-http';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-7-sonnet-20250219-v1:0';
const BEDROCK_REGION = process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1';
const BEDROCK_API_KEY = process.env.BEDROCK_API_KEY || process.env.API_KEY || null;
const BEDROCK_ENDPOINT = process.env.BEDROCK_API_URL || `https://bedrock-runtime.${BEDROCK_REGION}.amazonaws.com/model/${BEDROCK_MODEL_ID}/invoke`;
const awsCredentialProvider = defaultProvider();

const buildAnthropicMessages = (messages = []) => {
  const prepared = messages
    .filter(
      (msg) =>
        msg &&
        typeof msg === 'object' &&
        typeof msg.role === 'string' &&
        typeof msg.content === 'string'
    )
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: [
        {
          type: 'text',
          text: msg.content,
        },
      ],
    }));

  const firstUserIndex = prepared.findIndex((msg) => msg.role === 'user');
  if (firstUserIndex === -1) {
    return [];
  }

  return prepared.slice(firstUserIndex);
};

const extractTextFromBedrockResponse = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (Array.isArray(payload.content)) {
    const parts = payload.content
      .filter((part) => part && part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text.trim());
    if (parts.length > 0) {
      return parts.join('\n\n').trim();
    }
  }

  if (typeof payload.output_text === 'string') {
    return payload.output_text.trim();
  }

  if (typeof payload.result === 'string') {
    return payload.result.trim();
  }

  return null;
};

const invokeBedrockWithAwsCredentials = async (body) => {
  const request = new HttpRequest({
    method: 'POST',
    protocol: 'https:',
    hostname: `bedrock-runtime.${BEDROCK_REGION}.amazonaws.com`,
    path: `/model/${BEDROCK_MODEL_ID}/invoke`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
  });

  const signer = new SignatureV4({
    service: 'bedrock',
    region: BEDROCK_REGION,
    credentials: awsCredentialProvider,
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(request);
  const { protocol, hostname, path, headers, body: signedBody, method } = signedRequest;
  const url = `${protocol}//${hostname}${path}`;

  const fetchHeaders = { ...headers };
  delete fetchHeaders.host;
  delete fetchHeaders.Host;

  const response = await fetch(url, {
    method,
    headers: fetchHeaders,
    body: signedBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bedrock request failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

const invokeClaude = async ({ system, messages }) => {
  const preparedMessages = buildAnthropicMessages(messages).slice(-12);

  if (preparedMessages.length === 0) {
    throw new Error('No messages to send to Claude');
  }

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1024,
    temperature: 0.3,
    system: typeof system === 'string' && system.trim() ? system : undefined,
    messages: preparedMessages,
  };

  const body = JSON.stringify(payload);

  if (BEDROCK_API_KEY) {
    const response = await fetch(BEDROCK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-api-key': BEDROCK_API_KEY,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bedrock request failed (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    return extractTextFromBedrockResponse(json);
  }

  const json = await invokeBedrockWithAwsCredentials(body);
  return extractTextFromBedrockResponse(json);
};

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

// ===== AI CHAT ENDPOINT =====

app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body || {};

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const text = await invokeClaude({ messages, system });

    if (!text) {
      return res.status(502).json({ error: 'Claude returned an empty response' });
    }

    res.json({ text });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
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

  try {
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
