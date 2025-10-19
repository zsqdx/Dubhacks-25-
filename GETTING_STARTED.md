# Getting Started - Step by Step 🚀

## Step 1: Export Your Code from Figma Make

### In Figma Make:
1. Look for the **Download** or **Export** button (usually in the top right)
2. Click it to download a ZIP file
3. The ZIP will contain all your files (App.tsx, components, styles, etc.)

### What You'll Get:
- All `.tsx` files (your React components)
- `styles/globals.css` (your styling)
- `package.json` (dependency list)
- All the documentation files

---

## Step 2: Set Up Your Local Environment

### 2.1 Install Node.js (if you haven't already)
1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS version (recommended)
3. Install it (includes npm automatically)
4. Verify installation:
   ```bash
   node --version  # Should show v18 or higher
   npm --version   # Should show version number
   ```

### 2.2 Extract the ZIP File
1. Locate the downloaded ZIP file
2. Right-click → Extract All
3. Choose a location (e.g., `Documents/SnapSyllabus`)
4. You should now have a folder with all your code

---

## Step 3: Create Missing Configuration Files

Your Figma Make export might be missing some config files. Create these:

### 3.1 Create `vite.config.ts` in the root folder
Copy and paste this:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### 3.2 Create `tsconfig.json` in the root folder
Copy and paste this:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3.3 Create `tsconfig.node.json` in the root folder
Copy and paste this:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 3.4 Create `index.html` in the root folder
Copy and paste this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SnapSyllabus - AI Study Assistant</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

### 3.5 Create `main.tsx` in the root folder
Copy and paste this:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 3.6 Create `.gitignore` in the root folder
Copy and paste this:

```
# Dependencies
node_modules

# Build output
dist
dist-ssr
*.local

# Environment variables
.env
.env.local
.env.production.local
.env.development.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
```

---

## Step 4: Install Dependencies

### 4.1 Open Terminal/Command Prompt
**Windows:**
- Press `Win + R`
- Type `cmd` and press Enter
- Use `cd` to navigate to your project folder:
  ```bash
  cd Documents\SnapSyllabus
  ```

**Mac:**
- Press `Cmd + Space`
- Type `terminal` and press Enter
- Use `cd` to navigate:
  ```bash
  cd Documents/SnapSyllabus
  ```

### 4.2 Install All Dependencies
Run this command (it will take 2-3 minutes):
```bash
npm install
```

You should see:
- Downloading messages
- Progress bars
- "added XXX packages" at the end

---

## Step 5: Run Your Application

### Start the Development Server
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Open in Browser
1. Open your web browser
2. Go to: `http://localhost:5173`
3. Your SnapSyllabus app should load! 🎉

---

## Step 6: Test Your Application

### What to Test:
1. ✅ **Login Page** - Should show Google OAuth and email/password options
2. ✅ **Sign Up** - Create a test account (demo mode)
3. ✅ **Email Verification** - Enter any 6-digit code (demo mode)
4. ✅ **Canvas Setup** - Enter any token (demo mode)
5. ✅ **Dashboard** - Should show demo courses
6. ✅ **Course View** - Click a course, explore features
7. ✅ **AI Chat** - Try the chat interface
8. ✅ **Study Tools** - Check flashcards, quizzes, etc.

### Demo Mode Notes:
- Without a backend, the app runs in "demo mode"
- You can use ANY email/password to sign in
- Verification code can be ANY 6 digits
- Canvas token can be ANY text
- Data won't persist between sessions
- Perfect for presentations and screenshots!

---

## Step 7: Take Screenshots for Presentation

### Recommended Screenshots:
1. **Login Page**
   - Shows modern gradient design
   - Google OAuth button
   - Email/password form

2. **Email Verification**
   - 6-digit code input
   - Clean, modern UI

3. **Canvas Setup**
   - Token input form
   - Instructions

4. **Dashboard**
   - Course cards
   - Gradient accents
   - Clean layout

5. **Course View - Overview**
   - Sidebar navigation
   - Course details
   - Recent activity

6. **Course View - Assignments**
   - Assignment list
   - Due dates
   - Status indicators

7. **AI Chat**
   - Chat interface
   - Example conversation
   - Message input

8. **Study Tools - Flashcards**
   - Flashcard interface
   - Flip animation

9. **Study Tools - Quiz**
   - Quiz interface
   - Multiple choice

### How to Take Screenshots:
- **Windows**: `Win + Shift + S` (select area)
- **Mac**: `Cmd + Shift + 4` (select area)
- Save to a `screenshots/` folder

---

## Step 8: Deploy to the Web (Optional but Recommended)

### 8.1 Create GitHub Account
1. Go to [github.com](https://github.com)
2. Sign up (it's free)
3. Verify your email

### 8.2 Install Git
1. Download from [git-scm.com](https://git-scm.com)
2. Install with default settings

### 8.3 Push Code to GitHub
In your terminal (in project folder):

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit of SnapSyllabus"

# Create a new repository on GitHub (via website)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/snapsyllabus.git
git branch -M main
git push -u origin main
```

### 8.4 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Framework: **Vite**
6. Click "Deploy"
7. Wait 2-3 minutes
8. Get your live URL: `https://snapsyllabus-xxx.vercel.app`

**Now you have a live website to show in your presentation!** 🌐

---

## Common Issues & Solutions

### Issue: `npm: command not found`
**Solution**: Install Node.js from nodejs.org

### Issue: `Cannot find module 'react'`
**Solution**: Run `npm install` again

### Issue: Port 5173 already in use
**Solution**: 
- Kill the existing process, or
- Run `npm run dev -- --port 3000` to use port 3000

### Issue: Blank white page
**Solution**: 
- Check browser console (F12) for errors
- Make sure `main.tsx` and `index.html` are created

### Issue: TypeScript errors
**Solution**: 
- Make sure `tsconfig.json` is created
- Run `npm install typescript --save-dev`

### Issue: Styles not loading
**Solution**: 
- Check that `styles/globals.css` exists
- Make sure it's imported in `main.tsx`

### Issue: Components not found
**Solution**: 
- Check import paths (should use `./` prefix)
- Make sure all files are in correct folders

---

## Your Project Structure Should Look Like This:

```
SnapSyllabus/
├── index.html              ← Create this
├── main.tsx                ← Create this
├── vite.config.ts          ← Create this
├── tsconfig.json           ← Create this
├── tsconfig.node.json      ← Create this
├── package.json            ← From Figma Make
├── .gitignore              ← Create this
├── App.tsx                 ← From Figma Make
├── README.md               ← From Figma Make
├── DEPLOYMENT_GUIDE.md     ← From Figma Make
├── PRESENTATION_OUTLINE.md ← From Figma Make
├── components/             ← From Figma Make
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── CourseView.tsx
│   └── ... (all other components)
├── styles/                 ← From Figma Make
│   └── globals.css
└── node_modules/           ← Created by npm install
```

---

## Quick Command Reference

```bash
# Navigate to project folder
cd path/to/SnapSyllabus

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Stop the server
Ctrl + C (or Cmd + C on Mac)
```

---

## Next Steps

1. ✅ Export from Figma Make
2. ✅ Set up local environment
3. ✅ Create config files
4. ✅ Install dependencies
5. ✅ Run the app locally
6. ✅ Take screenshots
7. ✅ Deploy to Vercel (optional)
8. ✅ Prepare presentation

---

## Need Help?

### Resources:
- **Vite Docs**: [vitejs.dev](https://vitejs.dev)
- **React Docs**: [react.dev](https://react.dev)
- **Tailwind Docs**: [tailwindcss.com](https://tailwindcss.com)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

### Video Tutorials:
- Search YouTube: "Deploy React Vite app to Vercel"
- Search YouTube: "React project setup with Vite"

You've got this! 🚀
