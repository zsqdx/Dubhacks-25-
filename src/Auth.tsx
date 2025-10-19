import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface AuthProps {
  onAuthSuccess: (sessionId: string, user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Email validation
  const emailValidation = React.useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(email),
      message: email && !emailRegex.test(email) ? 'Please enter a valid email address' : ''
    };
  }, [email]);

  // Password validation
  const passwordValidation = React.useMemo(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };

    const isValid = Object.values(checks).every(v => v);

    return {
      isValid,
      checks,
      message: !isValid && password ? 'Password does not meet requirements' : ''
    };
  }, [password]);

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

      if (data.success) {
        // Store canvas token if it exists
        if (data.canvasToken) {
          localStorage.setItem('canvasToken', data.canvasToken);
        }
        onAuthSuccess(data.sessionId, data.user);
      } else {
        setError(data.error || 'Google login failed');
      }
    } catch (err) {
      setError('Failed to connect to auth server');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setError(null);

    // Client-side validation
    if (!emailValidation.isValid) {
      setError('Please enter a valid email address');
      return;
    }

    if (isSignup && !passwordValidation.isValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    setLoading(true);

    const endpoint = isSignup ? '/auth/signup' : '/auth/login';
    const body = isSignup ? { email, password, name } : { email, password };

    try {
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        // Store canvas token if it exists
        if (data.canvasToken) {
          localStorage.setItem('canvasToken', data.canvasToken);
        }
        onAuthSuccess(data.sessionId, data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to connect to auth server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '450px',
      margin: '50px auto',
      padding: '40px',
      border: '1px solid #ddd',
      borderRadius: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>CourseCompanion</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        AI-powered study assistant for Canvas
      </p>

      {/* Google Sign In */}
      <div style={{ marginBottom: '30px' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign in failed')}
          useOneTap
        />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '30px 0',
        color: '#999',
      }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
        <span style={{ padding: '0 15px', fontSize: '14px' }}>OR</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleCredentialsAuth}>
        {isSignup && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${emailTouched && !emailValidation.isValid ? '#ef4444' : '#ddd'}`,
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          {emailTouched && emailValidation.message && (
            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {emailValidation.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${isSignup && passwordTouched && !passwordValidation.isValid ? '#ef4444' : '#ddd'}`,
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          {isSignup && passwordTouched && (
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              <p style={{ fontWeight: '500', marginBottom: '4px', color: '#555' }}>Password requirements:</p>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                <li style={{ color: passwordValidation.checks.length ? '#10b981' : '#ef4444' }}>
                  At least 8 characters
                </li>
                <li style={{ color: passwordValidation.checks.uppercase ? '#10b981' : '#ef4444' }}>
                  One uppercase letter
                </li>
                <li style={{ color: passwordValidation.checks.lowercase ? '#10b981' : '#ef4444' }}>
                  One lowercase letter
                </li>
                <li style={{ color: passwordValidation.checks.number ? '#10b981' : '#ef4444' }}>
                  One number
                </li>
              </ul>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '6px',
          color: '#c33',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        {isSignup ? (
          <>
            Already have an account?{' '}
            <button
              onClick={() => setIsSignup(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Log In
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button
              onClick={() => setIsSignup(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
}
