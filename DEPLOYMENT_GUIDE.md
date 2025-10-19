# SnapSyllabus - Deployment & Presentation Guide

## 📦 Getting Your Code

### From Figma Make
1. **Download the code**: Click the download/export button in Figma Make
2. **You'll get**: A zip file with all your React components and files

### File Structure
Your application includes:
- React components (TSX files)
- Tailwind CSS styling
- shadcn/ui components
- All necessary dependencies

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Steps

1. **Extract the files** to a folder on your computer

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Required dependencies** (already in package.json):
   ```json
   {
     "dependencies": {
       "react": "^18.x",
       "react-dom": "^18.x",
       "react-router-dom": "^6.x",
       "@react-oauth/google": "latest",
       "lucide-react": "latest",
       "recharts": "^2.x",
       "sonner": "^2.0.3",
       "class-variance-authority": "latest",
       "clsx": "latest",
       "tailwind-merge": "latest"
     }
   }
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open browser**: Go to `http://localhost:5173` (or whatever port is shown)

---

## 🔧 Backend Setup (Required for Full Functionality)

Your app needs a backend server for:
- User authentication (Google OAuth + email/password)
- Canvas API integration
- Email verification
- Data persistence

### Backend Requirements

Create a Node.js/Express backend with these endpoints:

#### Authentication Endpoints
```javascript
POST /auth/google              // Google OAuth login
POST /auth/signup              // Email/password signup
POST /auth/login               // Email/password login
POST /auth/verify-email        // Verify email with code
POST /auth/resend-verification // Resend verification email
```

#### Canvas Endpoints
```javascript
POST /canvas/verify-token      // Verify Canvas API token
GET  /canvas/courses           // Get user's courses
GET  /canvas/course/:id        // Get course details
GET  /canvas/assignments/:id   // Get course assignments
GET  /canvas/modules/:id       // Get course modules
```

#### Chat Endpoint
```javascript
POST /chat/message             // AI tutor chat (integrate with OpenAI/Anthropic)
```

### Environment Variables
Create a `.env` file:
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Canvas API
CANVAS_API_URL=https://canvas.instructure.com/api/v1

# Database (PostgreSQL, MongoDB, etc.)
DATABASE_URL=your_database_url

# AI API (OpenAI, Anthropic, etc.)
OPENAI_API_KEY=your_openai_key

# Email Service (SendGrid, AWS SES, etc.)
EMAIL_API_KEY=your_email_service_key

# JWT Secret
JWT_SECRET=your_jwt_secret
```

### Demo Mode
The frontend currently works in **demo mode** without a backend:
- Authentication accepts any credentials
- Shows sample course data
- Email verification accepts any 6-digit code
- Chat doesn't actually call AI (you'd need to add mock responses)

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables (Google Client ID, etc.)
   - Deploy!

3. **Your app will be live** at: `your-app.vercel.app`

### Option 2: Netlify

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - New site from Git
   - Choose your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Deploy!

### Option 3: Railway/Render (For Full Stack)

Deploy both frontend and backend together:
- **Railway**: Great for Node.js backends + PostgreSQL
- **Render**: Free tier available, easy deployment

---

## 🎨 Presenting Your Application

### For Class Presentation

1. **Live Demo**:
   - Deploy to Vercel/Netlify (5 minutes setup)
   - Share the live URL: `https://your-snapsyllabus.vercel.app`
   - Walk through the features live

2. **Create a Demo Video**:
   - Use Loom, OBS, or built-in screen recording
   - Show: Login → Canvas setup → Dashboard → Course view → AI chat
   - Keep it 3-5 minutes

3. **Screenshots for Slides**:
   Take screenshots of:
   - ✅ Login/signup page (shows modern UI)
   - ✅ Email verification flow
   - ✅ Canvas token setup
   - ✅ Dashboard with courses
   - ✅ Course view with all features
   - ✅ AI chat interface
   - ✅ Study tools (flashcards, quizzes, etc.)

### Key Talking Points

**Problem Statement**:
- Students struggle to organize course materials
- Canvas interface is overwhelming
- Need personalized study assistance

**Solution**:
- SnapSyllabus connects to Canvas
- AI tutor helps with course content
- Study tools (flashcards, practice quizzes, summaries)
- Clean, modern interface

**Technical Stack**:
- Frontend: React + TypeScript + Tailwind CSS
- UI Components: shadcn/ui
- Authentication: Google OAuth + email/password
- API Integration: Canvas LMS API
- AI: OpenAI/Anthropic (for chat)
- Deployment: Vercel (frontend) + Railway (backend)

**Features Implemented**:
1. ✅ User authentication with email verification
2. ✅ Canvas API integration
3. ✅ Course dashboard with modern UI
4. ✅ Detailed course view with modules & assignments
5. ✅ AI chat tutor (course-specific)
6. ✅ Study tools: Flashcards, quizzes, summaries
7. ✅ Responsive design
8. ✅ Professional gradient branding

---

## 📊 Demo Data Setup

For presentation without a real backend, update demo data in:

### `/components/Dashboard.tsx`
Add more realistic course data:
```typescript
const demoCourses = [
  {
    id: '1',
    name: 'Computer Science 101',
    course_code: 'CS 101',
    enrollment_term_id: '1',
    // ... more courses
  }
];
```

### `/components/CourseView.tsx`
Add sample assignments and modules

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:5173` (development)
   - `https://your-app.vercel.app` (production)
6. Copy Client ID and add to your code

---

## 📝 What to Include in Presentation

### README.md for GitHub
```markdown
# SnapSyllabus

AI-powered study assistant that integrates with Canvas LMS

## Features
- 🔐 Google OAuth & Email authentication
- 📚 Canvas course integration
- 🤖 AI tutor chat
- 📇 Study tools (flashcards, quizzes, summaries)
- 📱 Responsive design

## Tech Stack
React • TypeScript • Tailwind CSS • shadcn/ui

## Live Demo
[your-app.vercel.app]
```

### For Submission
Include:
1. ✅ GitHub repository link
2. ✅ Live deployment URL
3. ✅ Demo video (if required)
4. ✅ Screenshots
5. ✅ README with setup instructions

---

## 🎯 Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] Google OAuth credentials set up
- [ ] Deployed to Vercel/Netlify
- [ ] Live URL tested
- [ ] Demo video recorded (optional)
- [ ] Screenshots taken
- [ ] Presentation slides prepared
- [ ] README updated

---

## 💡 Tips

1. **Test your deployed app** before presenting
2. **Have backup screenshots** in case live demo fails
3. **Prepare demo account** with sample data
4. **Practice the walkthrough** 2-3 times
5. **Have backend in demo mode** if real backend isn't ready

---

## 📧 Need Help?

Common issues:
- **"Module not found"**: Run `npm install` again
- **"Google OAuth not working"**: Check authorized origins
- **"Canvas API failing"**: Verify token and permissions
- **"Build failing"**: Check Node.js version (needs v18+)

Good luck with your presentation! 🚀
