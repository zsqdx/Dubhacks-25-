import React from 'react';
import { Link } from 'react-router-dom';
import CanvasLogin from '../CanvasLogin';

interface DashboardProps {
  user: any;
  canvasToken: string | null;
  sessionId: string;
  onLogout: () => void;
  onReconnectCanvas: () => void;
}

export default function Dashboard({ user, canvasToken, sessionId, onLogout, onReconnectCanvas }: DashboardProps) {
  return (
    <div>
      <nav style={{
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <strong>Welcome, {user.name}!</strong>
            <span style={{ color: '#666', marginLeft: '10px', fontSize: '14px' }}>
              ({user.email})
            </span>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: '#007bff',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Canvas Dashboard
            </Link>
            <Link
              to="/chat"
              style={{
                textDecoration: 'none',
                color: '#007bff',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              AI Chat
            </Link>
          </div>
        </div>
        <button
          onClick={onLogout}
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
      </nav>

      {canvasToken !== 'skipped' ? (
        <CanvasLogin initialToken={canvasToken} userId={user.userId} sessionId={sessionId} />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Canvas Not Connected</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            To use AI study features, please connect your Canvas account
          </p>
          <button
            onClick={onReconnectCanvas}
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
