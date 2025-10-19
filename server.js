import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { S3Storage, generateId } from './s3Storage.js';
import { OAuth2Client } from 'google-auth-library';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const BEDROCK_REGION = process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1';
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-7-sonnet-20250219-v1:0';
const BEDROCK_API_KEY = process.env.BEDROCK_API_KEY || process.env.AWS_BEDROCK_API_KEY || null;

const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsSessionToken = process.env.AWS_SESSION_TOKEN;

const ensureBedrockCredentials = () => {
  if (!awsAccessKeyId || !awsSecretAccessKey) {
    throw new Error('Bedrock credentials are not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
  }
};

const hmacSha256 = (key, data) => crypto.createHmac('sha256', key).update(data, 'utf8').digest();
const sha256Hex = (data) => crypto.createHash('sha256').update(data, 'utf8').digest('hex');

const getSignatureKey = (secretKey, dateStamp, regionName, serviceName) => {
  const kDate = hmacSha256(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, regionName);
  const kService = hmacSha256(kRegion, serviceName);
  return hmacSha256(kService, 'aws4_request');
};

const signBedrockRequest = (method, path, body, now = new Date()) => {
  ensureBedrockCredentials();

  const service = 'bedrock';
  const host = `bedrock-runtime.${BEDROCK_REGION}.amazonaws.com`;
  const endpoint = `https://${host}${path}`;

  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '') + 'Z';
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = sha256Hex(body);

  const canonicalHeadersMap = [
    ['content-type', 'application/json'],
    ['host', host],
    ['x-amz-date', amzDate],
    ['x-amz-content-sha256', payloadHash],
  ];

  if (awsSessionToken) {
    canonicalHeadersMap.push(['x-amz-security-token', awsSessionToken]);
  }

  if (BEDROCK_API_KEY) {
    canonicalHeadersMap.push(['x-amz-api-key', BEDROCK_API_KEY]);
  }

  canonicalHeadersMap.sort((a, b) => a[0].localeCompare(b[0]));

  const canonicalHeaders = canonicalHeadersMap.map(([key, value]) => `${key}:${value.trim()}\n`).join('');
  const signedHeaders = canonicalHeadersMap.map(([key]) => key).join(';');

  const canonicalRequest = [
    method,
    path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${BEDROCK_REGION}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = getSignatureKey(awsSecretAccessKey, dateStamp, BEDROCK_REGION, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

  const authorizationHeader = `${algorithm} Credential=${awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers = {
    'Content-Type': 'application/json',
    'X-Amz-Date': amzDate,
    'X-Amz-Content-Sha256': payloadHash,
    Authorization: authorizationHeader,
  };

  if (awsSessionToken) {
    headers['X-Amz-Security-Token'] = awsSessionToken;
  }

  if (BEDROCK_API_KEY) {
    headers['X-Amz-Api-Key'] = BEDROCK_API_KEY;
  }

  return { endpoint, headers };
};

const callBedrockConverse = async (messages, reasoningConfig = { thinking: { type: 'enabled', budget_tokens: 2000 } }) => {
  const path = `/model/${encodeURIComponent(BEDROCK_MODEL_ID)}/converse`;
  const payload = JSON.stringify({
    messages,
    additionalModelRequestFields: reasoningConfig,
  });

  const { endpoint, headers } = signBedrockRequest('POST', path, payload);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: payload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bedrock request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

const normalizeConversationHistory = (history = []) =>
  history
    .filter((entry) => entry && typeof entry.text === 'string' && entry.text.trim())
    .map((entry) => ({
      role: entry.isAI ? 'assistant' : 'user',
      content: [
        {
          type: 'text',
          text: entry.text,
          text: {
            text: entry.text,
          },
        },
      ],
    }));

app.post('/ai/chat', async (req, res) => {
  const { prompt, history, reasoningBudget } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const normalizedHistory = normalizeConversationHistory(history);
    normalizedHistory.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt,
          text: {
            text: prompt,
          },
        },
      ],
    });

    const reasoningConfig = reasoningBudget
      ? { thinking: { type: 'enabled', budget_tokens: Number(reasoningBudget) || 2000 } }
      : { thinking: { type: 'enabled', budget_tokens: 2000 } };

    const bedrockResponse = await callBedrockConverse(normalizedHistory, reasoningConfig);

    const outputMessage = bedrockResponse?.output?.message;
    const contentBlocks = Array.isArray(outputMessage?.content) ? outputMessage.content : [];

    let responseText = '';
    let reasoningText = '';

    contentBlocks.forEach((block) => {
      if (!block || typeof block !== 'object') return;

      if (typeof block.text === 'string') {
        responseText += (responseText ? '\n\n' : '') + block.text;
      } else if (block?.text?.text) {
        responseText += (responseText ? '\n\n' : '') + block.text.text;
      }

      if (typeof block.reasoning === 'string') {
        reasoningText += (reasoningText ? '\n\n' : '') + block.reasoning;
      } else if (block?.reasoning?.thinking) {
        reasoningText += (reasoningText ? '\n\n' : '') + block.reasoning.thinking;
      } else if (block?.reasoning?.reasoning_text) {
        reasoningText += (reasoningText ? '\n\n' : '') + block.reasoning.reasoning_text;
      } else if (block?.reasoningContent?.reasoningText) {
      if (block?.text?.text) {
        responseText += (responseText ? '\n\n' : '') + block.text.text;
      }
      if (block?.reasoningContent?.reasoningText) {
        reasoningText += (reasoningText ? '\n\n' : '') + block.reasoningContent.reasoningText;
      }
    });

    res.json({
      text: responseText || 'I was unable to generate a response.',
      reasoning: reasoningText || null,
      raw: bedrockResponse,
    });
  } catch (error) {
    console.error('Bedrock chat error:', error);
    res.status(500).json({ error: 'Failed to generate AI response.' });
  }
});

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
