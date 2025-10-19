import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import CanvasSetup from './CanvasSetup';
import CanvasLogin from '../CanvasLogin';

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

  // Fully set up - show main app
  return (
    <div>
      <div style={{
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <strong>Welcome, {user.name}!</strong>
          <span style={{ color: '#666', marginLeft: '10px', fontSize: '14px' }}>
            ({user.email})
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Logout
        </button>
      </div>

      {canvasToken !== 'skipped' ? (
        <CanvasLogin initialToken={canvasToken} userId={user.userId} sessionId={sessionId} />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Canvas Not Connected</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            To use AI study features, please connect your Canvas account
          </p>
          <button
            onClick={() => setCanvasToken(null)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Connect Canvas Now
          </button>
        </div>
      )}
    </div>
  );
}
