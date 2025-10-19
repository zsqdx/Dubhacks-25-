import React, { useState } from 'react';
import { useTheme } from './App';
import { ExternalLink, Info } from 'lucide-react';

interface CanvasSetupProps {
  sessionId: string;
  onSetupComplete: (canvasToken: string) => void;
}

export default function CanvasSetup({ sessionId, onSetupComplete }: CanvasSetupProps) {
  const { theme } = useTheme();
  const [canvasToken, setCanvasToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    light: {
      bg: '#f9fafb',
      cardBg: '#ffffff',
      border: '#e5e7eb',
      text: '#111827',
      textSecondary: '#6b7280',
      accent: '#6d28d9',
      infoBg: '#eff6ff',
      infoBorder: '#bfdbfe',
      infoText: '#1e40af',
    },
    dark: {
      bg: '#0a0a0a',
      cardBg: '#1a1a1a',
      border: '#2d2d2d',
      text: '#f3f4f6',
      textSecondary: '#9ca3af',
      accent: '#8b5cf6',
      infoBg: '#1e293b',
      infoBorder: '#334155',
      infoText: '#93c5fd',
    },
  };
  const c = colors[theme];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canvasToken.trim()) {
      setError('Please enter a Canvas access token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/auth/setup-canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, canvasToken }),
      });

      const data = await response.json();

      if (data.success) {
        onSetupComplete(canvasToken);
      } else {
        setError(data.error || 'Failed to setup Canvas');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          background: c.cardBg,
          border: `1px solid ${c.border}`,
          borderRadius: '12px',
          boxShadow:
            theme === 'light'
              ? '0 6px 24px rgba(0,0,0,0.06)'
              : '0 6px 18px rgba(0,0,0,0.4)',
          padding: '40px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              marginBottom: '8px',
              color: c.text,
              margin: 0,
            }}
          >
            Setup Canvas Integration
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: c.textSecondary,
              margin: '8px 0 0 0',
            }}
          >
            Connect your Canvas account to get personalized study assistance
          </p>
        </div>

        {/* Instructions Card */}
        <div
          style={{
            padding: '20px',
            backgroundColor: c.infoBg,
            border: `1px solid ${c.infoBorder}`,
            borderRadius: '10px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <Info size={18} color={c.infoText} />
            <h3
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: c.infoText,
              }}
            >
              How to get your Canvas Access Token
            </h3>
          </div>
          <ol
            style={{
              margin: '0',
              paddingLeft: '20px',
              color: c.textSecondary,
              lineHeight: '1.8',
              fontSize: '14px',
            }}
          >
            <li>
              Go to{' '}
              <a
                href="https://canvas.instructure.com/profile/settings"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: c.accent,
                  textDecoration: 'none',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Canvas Profile Settings
                <ExternalLink size={14} />
              </a>
            </li>
            <li>Scroll down to "Approved Integrations"</li>
            <li>Click "+ New Access Token"</li>
            <li>Enter a purpose (e.g., "CourseCompanion")</li>
            <li>Click "Generate Token"</li>
            <li>Copy the token and paste it below</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: c.text,
              }}
            >
              Canvas Access Token
            </label>
            <input
              type="password"
              value={canvasToken}
              onChange={(e) => setCanvasToken(e.target.value)}
              placeholder="Paste your Canvas access token here"
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                color: c.text,
                background: theme === 'dark' ? '#111' : '#fff',
                outline: 'none',
              }}
            />
            <p
              style={{
                fontSize: '12px',
                color: c.textSecondary,
                marginTop: '6px',
                margin: '6px 0 0 0',
              }}
            >
              Your token is stored securely and never shared
            </p>
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
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? 'Verifying...' : 'Connect Canvas'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: theme === 'dark' ? '#3f1d1d' : '#fee2e2',
              border: `1px solid ${theme === 'dark' ? '#7f1d1d' : '#fca5a5'}`,
              color: theme === 'dark' ? '#fca5a5' : '#b91c1c',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* Skip Button */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => onSetupComplete('')}
            style={{
              background: 'none',
              border: 'none',
              color: c.textSecondary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              padding: '8px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = c.accent)}
            onMouseOut={(e) => (e.currentTarget.style.color = c.textSecondary)}
          >
            Skip for now (limited features)
          </button>
        </div>
      </div>
    </div>
  );
}
