import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './Auth';
import CanvasSetup from './CanvasSetup';
import Dashboard from './Dashboard';
import ChatPageWrapper from './ChatPageWrapper';

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [canvasToken, setCanvasToken] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    if (savedSessionId) {
      // Verify session is still valid
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
            // Load canvas token from localStorage for now
            const savedCanvasToken = localStorage.getItem('canvasToken');
            if (savedCanvasToken) {
              setCanvasToken(savedCanvasToken);
            }
          } else {
            localStorage.removeItem('sessionId');
          }
        })
        .catch(() => {
          localStorage.removeItem('sessionId');
        });
    }
  }, []);

  const handleAuthSuccess = (newSessionId: string, newUser: any) => {
    setSessionId(newSessionId);
    setUser(newUser);
    localStorage.setItem('sessionId', newSessionId);

    // Check if user already has Canvas token stored in localStorage
    const savedCanvasToken = localStorage.getItem('canvasToken');
    if (savedCanvasToken) {
      setCanvasToken(savedCanvasToken);
    }
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
    localStorage.removeItem('canvasToken');
  };

  // Not logged in - show auth
  if (!sessionId || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
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
      </Routes>
    </Router>
  );
}
