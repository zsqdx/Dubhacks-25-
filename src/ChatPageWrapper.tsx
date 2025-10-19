import React from 'react';
import { Link } from 'react-router-dom';
import ChatPage from './ChatPage';

interface ChatPageWrapperProps {
  user: any;
  onLogout: () => void;
}

export default function ChatPageWrapper({ user, onLogout }: ChatPageWrapperProps) {
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
      <ChatPage />
    </div>
  );
}
