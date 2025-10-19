# SnapSyllabus 🎓

An AI-powered study assistant that integrates with Canvas LMS to provide personalized learning support.

![SnapSyllabus](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop)

## ✨ Features

### Authentication
- 🔐 Google OAuth integration
- 📧 Email/password authentication
- ✉️ Email verification system

### Canvas Integration
- 📚 Automatic course sync from Canvas
- 📝 Assignment tracking
- 📖 Module organization
- 🔗 Secure Canvas API token management

### AI Tutor
- 🤖 Course-specific AI teaching assistant
- 💬 Real-time chat interface
- 📊 Context-aware responses
- 🎯 Personalized study help

### Study Tools
- 📇 AI-generated flashcards
- 📝 Practice quizzes
- 📋 Syllabus summaries
- 📖 Reading summaries

### Modern UI/UX
- 🎨 Beautiful gradient design
- 📱 Fully responsive
- 🌙 Clean, professional interface
- ⚡ Fast and intuitive

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router
- **Icons**: Lucide React
- **Charts**: Recharts
- **Authentication**: Google OAuth + Custom Auth
- **API Integration**: Canvas LMS API
- **Build Tool**: Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/snapsyllabus.git
cd snapsyllabus
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:3001
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## 🎯 Usage

### First Time Setup

1. **Sign up** using Google OAuth or email/password
2. **Verify your email** (check your inbox for the code)
3. **Connect Canvas** by entering your Canvas API token
4. **View your courses** on the dashboard
5. **Start learning** with AI assistance!

### Getting Your Canvas Token

1. Log into your Canvas account
2. Go to Account → Settings
3. Scroll to "Approved Integrations"
4. Click "+ New Access Token"
5. Give it a purpose (e.g., "SnapSyllabus")
6. Copy the token and paste it into SnapSyllabus

## 📁 Project Structure

```
snapsyllabus/
├── components/
│   ├── Auth.tsx                 # Authentication UI
│   ├── EmailVerification.tsx    # Email verification flow
│   ├── CanvasSetup.tsx          # Canvas token setup
│   ├── Dashboard.tsx            # Course dashboard
│   ├── CourseView.tsx           # Detailed course view
│   ├── ChatPage.tsx             # AI chat interface
│   └── ui/                      # shadcn/ui components
├── styles/
│   └── globals.css              # Global styles & Tailwind config
└── App.tsx                      # Main app component
```

## 🌟 Key Features Explained

### Course View
The comprehensive course view includes:
- **Sidebar Navigation**: Quick access to modules, assignments, and study tools
- **AI Tutor Tab**: Get help specific to the course
- **Assignments**: Track all your coursework
- **Modules**: Organized course content
- **Study Tools**: Flashcards, quizzes, and summaries

### Study Tools
- **Flashcards**: AI-generated cards from course content
- **Practice Quizzes**: Test your knowledge
- **Syllabus Summary**: Quick overview of course expectations
- **Reading Summaries**: Condensed versions of course materials

## 🔧 Backend Setup (Optional)

For full functionality, you'll need a backend with these endpoints:

### Authentication
- `POST /auth/google` - Google OAuth
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Email verification
- `POST /auth/resend-verification` - Resend verification email

### Canvas Integration
- `POST /canvas/verify-token` - Verify Canvas token
- `GET /canvas/courses` - Fetch user courses
- `GET /canvas/course/:id` - Get course details
- `GET /canvas/assignments/:id` - Get assignments
- `GET /canvas/modules/:id` - Get course modules

### AI Chat
- `POST /chat/message` - Send message to AI tutor

**Note**: The app currently runs in demo mode without a backend.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables
6. Deploy!

Your app will be live at `https://your-app.vercel.app`

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📸 Screenshots

### Login Page
Beautiful gradient design with Google OAuth and email authentication

### Dashboard
Modern course cards with gradient accents and quick actions

### Course View
Comprehensive view with sidebar navigation and tabbed content

### AI Chat
Real-time chat interface with course-specific AI assistance

## 🎓 Perfect For

- Students using Canvas LMS
- Anyone wanting AI study assistance
- Organizing course materials
- Generating study resources
- Getting course-specific help

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for your coursework or personal projects.

## 🙏 Acknowledgments

- Built with React and TypeScript
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for students everywhere
