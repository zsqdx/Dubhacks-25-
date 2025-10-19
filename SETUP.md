# SnapSyllabus - Unified Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
# AWS S3 Configuration
AWS_REGION=us-east-2
S3_BUCKET_NAME=dubhacks25-bucket

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here

# Vite Frontend (for Google OAuth)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Run the Application
**Single command to start both frontend and backend:**
```bash
npm run dev
```

This will start:
- **Frontend (Vite):** http://localhost:5173
- **Backend (Express):** http://localhost:3001

## Available Scripts

- `npm run dev` - Start both frontend and backend concurrently (recommended)
- `npm run dev:frontend` - Start only the Vite frontend
- `npm run dev:backend` - Start only the Express backend
- `npm run build` - Build the frontend for production

## Application Structure

```
/
├── src/                    # React frontend source
│   ├── App.tsx            # Main app with routing
│   ├── Dashboard.tsx      # Canvas dashboard page
│   ├── ChatPage.tsx       # AI chat interface
│   ├── Auth.tsx           # Authentication UI
│   └── CanvasSetup.tsx    # Canvas token setup
├── server.js              # Express backend (port 3001)
├── s3Storage.js           # AWS S3 storage layer
├── canvasApi.ts           # Canvas LMS API client
└── CanvasLogin.tsx        # Canvas integration component
```

## Features

### Pages
- **`/`** - Canvas Dashboard (shows courses and assignments)
- **`/chat`** - AI Teaching Assistant (chat interface)

### Authentication
- Google OAuth login
- Credentials-based login (email/password)
- Canvas LMS token integration

### Backend Endpoints
- `POST /auth/google` - Google OAuth authentication
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login with credentials
- `POST /auth/setup-canvas` - Setup Canvas token
- `GET /auth/session` - Get current session
- `POST /auth/logout` - Logout
- `/canvas-api/*` - Canvas API proxy (avoids CORS)

## Navigation

Once logged in, use the navigation bar to switch between:
1. **Canvas Dashboard** - View your courses and assignments
2. **AI Chat** - Chat with the AI teaching assistant

## Tech Stack

- **Frontend:** React 19.2.0 + TypeScript + Vite
- **Backend:** Express.js + Node.js
- **Database:** AWS S3
- **Authentication:** Google OAuth + bcrypt
- **API Integration:** Canvas LMS API
