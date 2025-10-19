import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './Auth';
import CanvasSetup from './CanvasSetup';
import Dashboard from './Dashboard';
import ChatPageWrapper from './ChatPageWrapper';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [canvasToken, setCanvasToken] = useState<string | null>(null);

  // Check for existing JWT token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      // Verify token is still valid
      fetch('http://localhost:3001/auth/session', {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setToken(savedToken);
            setUser(data.user);
            // Load canvas token from localStorage
            const savedCanvasToken = localStorage.getItem('canvasToken');
            if (savedCanvasToken) {
              setCanvasToken(savedCanvasToken);
            }
          } else {
            localStorage.removeItem('authToken');
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        });
    }
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken);

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
    if (token) {
      fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(() => {});
    }

    setToken(null);
    setUser(null);
    setCanvasToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('canvasToken');
  };

  // Not logged in - show auth
  if (!token || !user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Logged in but no Canvas token - show Canvas setup
  if (!canvasToken) {
    return <CanvasSetup token={token} onSetupComplete={handleCanvasSetup} />;
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
              token={token}
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
