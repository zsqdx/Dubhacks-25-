import React, { useState } from 'react';

interface CanvasSetupProps {
  sessionId: string;
  onSetupComplete: (canvasToken: string) => void;
}

export default function CanvasSetup({ sessionId, onSetupComplete }: CanvasSetupProps) {
  const [canvasToken, setCanvasToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div style={{
      maxWidth: '600px',
      margin: '50px auto',
      padding: '40px',
      border: '1px solid #ddd',
      borderRadius: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ marginTop: 0 }}>Setup Canvas Integration</h2>
      <p style={{ color: '#666', marginBottom: '25px' }}>
        Connect your Canvas account to get personalized study assistance
      </p>

      <div style={{
        padding: '20px',
        backgroundColor: '#f0f8ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        marginBottom: '25px',
      }}>
        <h3 style={{ marginTop: 0, fontSize: '16px', color: '#0066cc' }}>
          How to get your Canvas Access Token:
        </h3>
        <ol style={{ margin: '10px 0 0 0', paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
          <li>
            Go to{' '}
            <a
              href="https://canvas.instructure.com/profile/settings"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff' }}
            >
              canvas.instructure.com/profile/settings
            </a>
          </li>
          <li>Scroll down to "Approved Integrations"</li>
          <li>Click "+ New Access Token"</li>
          <li>Enter a purpose (e.g., "SnapSyllabus")</li>
          <li>Click "Generate Token"</li>
          <li>Copy the token and paste it below</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
          }}>
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
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Your token is stored securely and never shared
          </p>
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
          {loading ? 'Verifying...' : 'Connect Canvas'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '6px',
          color: '#c33',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <button
        onClick={() => onSetupComplete('')}
        style={{
          marginTop: '20px',
          background: 'none',
          border: 'none',
          color: '#666',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontSize: '14px',
        }}
      >
        Skip for now (limited features)
      </button>
    </div>
  );
}
