import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useTheme } from './App';

interface AuthProps {
  onAuthSuccess: (sessionId: string, user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await response.json();
      if (data.success) onAuthSuccess(data.sessionId, data.user);
      else setError(data.error || 'Google login failed');
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isSignup ? '/auth/signup' : '/auth/login';
    const body = isSignup ? { email, password, name } : { email, password };

    try {
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success) onAuthSuccess(data.sessionId, data.user);
      else setError(data.error || 'Authentication failed');
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    light: {
      bg: '#f9fafb',
      cardBg: '#ffffff',
      border: '#e5e7eb',
      text: '#111827',
      textSecondary: '#6b7280',
      accent: '#6d28d9',
    },
    dark: {
      bg: '#0a0a0a',
      cardBg: '#1a1a1a',
      border: '#2d2d2d',
      text: '#f3f4f6',
      textSecondary: '#9ca3af',
      accent: '#8b5cf6',
    },
  };
  const c = colors[theme];

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: c.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto',
        background: c.cardBg,
        border: `1px solid ${c.border}`,
        borderRadius: '12px',
        boxShadow: theme === 'light' ? '0 6px 24px rgba(0,0,0,0.06)' : '0 6px 18px rgba(0,0,0,0.4)',
        padding: '40px',
      }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 700,
            marginBottom: '6px',
            color: c.text,
          }}>
            CourseCompanion
          </h1>
          <p style={{
            fontSize: '14px',
            color: c.textSecondary,
            margin: 0,
          }}>
            Sign in to continue
          </p>
        </div>

        {/* Google Sign In */}
        <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '24px',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign in failed')}
                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                width="320"
              />
            </div>
          </div>

        {/* Divider */}
        <div style={{
          textAlign: 'center',
          color: c.textSecondary,
          fontSize: '13px',
          margin: '20px 0',
          position: 'relative',
        }}>
          <span style={{
            background: c.cardBg,
            padding: '0 8px',
            position: 'relative',
            zIndex: 2,
          }}>or continue with email</span>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: c.border,
            zIndex: 1,
          }} />
        </div>

        {/* Form */}
        <form onSubmit={handleCredentialsAuth}>
          {isSignup && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', color: c.text }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${c.border}`,
                  marginTop: '6px',
                  fontSize: '14px',
                  color: c.text,
                  background: theme === 'dark' ? '#111' : '#fff',
                }}
              />
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', color: c.text }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                marginTop: '6px',
                fontSize: '14px',
                color: c.text,
                background: theme === 'dark' ? '#111' : '#fff',
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '14px', color: c.text }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                marginTop: '6px',
                fontSize: '14px',
                color: c.text,
                background: theme === 'dark' ? '#111' : '#fff',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: c.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? 'Signing in...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '10px',
            borderRadius: '8px',
            background: theme === 'dark' ? '#3f1d1d' : '#fee2e2',
            color: theme === 'dark' ? '#fca5a5' : '#b91c1c',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {/* Switch Link */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: c.textSecondary,
        }}>
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button onClick={() => setIsSignup(false)} style={{
                background: 'none',
                border: 'none',
                color: c.accent,
                fontWeight: 600,
                cursor: 'pointer',
              }}>Sign In</button>
            </>
          ) : (
            <>
              New to CourseCompanion?{' '}
              <button onClick={() => setIsSignup(true)} style={{
                background: 'none',
                border: 'none',
                color: c.accent,
                fontWeight: 600,
                cursor: 'pointer',
              }}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
