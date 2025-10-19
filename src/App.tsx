import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import CanvasSetup from './CanvasSetup';
import Dashboard from './Dashboard';
import ChatPageWrapper from './ChatPageWrapper';

// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [canvasToken, setCanvasToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Load saved theme preference or default to system preference
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  // Save theme preference and apply class
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // Check existing session on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    if (savedSessionId) {
      fetch('http://localhost:3001/auth/session', {
        headers: { Authorization: `Bearer ${savedSessionId}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSessionId(savedSessionId);
            setUser(data.user);
            const savedCanvasToken = localStorage.getItem('canvasToken');
            if (savedCanvasToken) setCanvasToken(savedCanvasToken);
          } else {
            localStorage.removeItem('sessionId');
          }
        })
        .catch(() => localStorage.removeItem('sessionId'));
    }
  }, []);

  const handleAuthSuccess = (newSessionId: string, newUser: any) => {
    setSessionId(newSessionId);
    setUser(newUser);
    localStorage.setItem('sessionId', newSessionId);

    const savedCanvasToken = localStorage.getItem('canvasToken');
    if (savedCanvasToken) setCanvasToken(savedCanvasToken);
  };

  const handleCanvasSetup = (token: string) => {
    if (token) {
      setCanvasToken(token);
      localStorage.setItem('canvasToken', token);
    } else {
      setCanvasToken('skipped');
    }
  };

  const handleLogout = () => {
    if (sessionId) {
      fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionId}` },
      }).catch(() => {});
    }

    setSessionId(null);
    setUser(null);
    setCanvasToken(null);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('canvasToken');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div
        style={{
          minHeight: '100vh',
          background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
          transition: 'background 0.3s ease',
        }}
      >
        {/* Global styles */}
        <style>{`
          * {
            transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          ::-webkit-scrollbar {
            width: 0px;
            height: 0px;
            display: none;
          }
          * {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          *:focus-visible {
            outline: 2px solid #8b5cf6;
            outline-offset: 2px;
          }
        `}</style>

        {/* Render appropriate page */}
        {!sessionId || !user ? (
          <Auth onAuthSuccess={handleAuthSuccess} />
        ) : !canvasToken ? (
          <CanvasSetup sessionId={sessionId} onSetupComplete={handleCanvasSetup} />
        ) : (
          <Router>
            <Routes>
              {/* Dashboard */}
              <Route
                path="/dashboard"
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

              {/* AI Chat */}
              <Route
                path="/chat"
                element={<ChatPageWrapper user={user} onLogout={handleLogout} />}
              />

              {/* Redirect root `/` → `/dashboard` */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        )}
      </div>
    </ThemeContext.Provider>
  );
}
