import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Auth from './components/Auth';
import EmailVerification from './components/EmailVerification';
import CanvasSetup from './components/CanvasSetup';
import Dashboard from './components/Dashboard';
import ChatPageWrapper from './components/ChatPageWrapper';
import CourseView from './components/CourseView';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [canvasToken, setCanvasToken] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    const savedUser = localStorage.getItem('user');
    
    if (savedSessionId && savedUser) {
      // Try to verify session if backend is available
      fetch('http://localhost:3001/auth/session', {
        headers: {
          'Authorization': `Bearer ${savedSessionId}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSessionId(savedSessionId);
            setUser(data.user);
            const savedCanvasToken = localStorage.getItem('canvasToken');
            if (savedCanvasToken) {
              setCanvasToken(savedCanvasToken);
            }
          } else {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('user');
          }
        })
        .catch(() => {
          // Backend not available, use saved session
          setSessionId(savedSessionId);
          setUser(JSON.parse(savedUser));
          const savedCanvasToken = localStorage.getItem('canvasToken');
          if (savedCanvasToken) {
            setCanvasToken(savedCanvasToken);
          }
        });
    }
  }, []);

  const handleAuthSuccess = (newSessionId: string, newUser: any) => {
    setSessionId(newSessionId);
    setUser(newUser);
    setPendingVerificationEmail(null); // Clear verification state
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Check if user already has Canvas token stored in localStorage
    const savedCanvasToken = localStorage.getItem('canvasToken');
    if (savedCanvasToken) {
      setCanvasToken(savedCanvasToken);
    }
  };

  const handleNeedVerification = (email: string) => {
    setPendingVerificationEmail(email);
  };

  const handleBackToAuth = () => {
    setPendingVerificationEmail(null);
  };

  const handleCanvasSetup = (token: string) => {
    if (token) {
      setCanvasToken(token);
      localStorage.setItem('canvasToken', token);
    } else {
      // Skipped Canvas setup
      setCanvasToken('skipped');
    }
  };

  const handleLogout = () => {
    if (sessionId) {
      fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      }).catch(() => {});
    }

    setSessionId(null);
    setUser(null);
    setCanvasToken(null);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    localStorage.removeItem('canvasToken');
  };

  // Email verification pending
  if (pendingVerificationEmail) {
    return (
      <EmailVerification
        email={pendingVerificationEmail}
        onVerificationComplete={handleAuthSuccess}
        onBackToAuth={handleBackToAuth}
      />
    );
  }

  // Not logged in - show auth
  if (!sessionId || !user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Auth 
          onAuthSuccess={handleAuthSuccess}
          onNeedVerification={handleNeedVerification}
        />
      </GoogleOAuthProvider>
    );
  }

  // Logged in but no Canvas token - show Canvas setup
  if (!canvasToken) {
    return <CanvasSetup sessionId={sessionId} onSetupComplete={handleCanvasSetup} />;
  }

  // Fully set up - show main app with routing
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              user={user}
              canvasToken={canvasToken}
              sessionId={sessionId}
              onLogout={handleLogout}
              onReconnectCanvas={() => setCanvasToken(null)}
            />
          }
        />
        <Route
          path="/chat"
          element={
            <ChatPageWrapper
              user={user}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/course/:courseId"
          element={
            <CourseView
              user={user}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="*"
          element={
            <Dashboard
              user={user}
              canvasToken={canvasToken}
              sessionId={sessionId}
              onLogout={handleLogout}
              onReconnectCanvas={() => setCanvasToken(null)}
            />
          }
        />
      </Routes>
    </Router>
  );
}
