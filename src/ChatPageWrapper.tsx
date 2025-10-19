import React from 'react';
import ChatPage from './ChatPage';
import Navbar from './Navbar';
import { useTheme } from './App';

interface ChatPageWrapperProps {
  user: any;
  onLogout: () => void;
}

export default function ChatPageWrapper({ user, onLogout }: ChatPageWrapperProps) {
  const { theme } = useTheme();

  const colors = {
    light: {
      bg: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
    dark: {
      bg: '#0a0a0a',
      text: '#f3f4f6',
      textSecondary: '#9ca3af',
      border: '#2d2d2d',
    },
  };
  const c = colors[theme];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: c.bg,
        color: c.text,
        transition: 'background 0.3s ease, color 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Navbar always at top */}
      <Navbar />

      {/* Header section */}
      <div
        style={{
          borderBottom: `1px solid ${c.border}`,
          padding: '16px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              margin: 0,
              color: c.text,
            }}
          >
            AI Tutor Chat
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: c.textSecondary,
              marginTop: '4px',
            }}
          >
            Personalized help based on your Canvas courses and progress.
          </p>
        </div>

        <button
          onClick={onLogout}
          style={{
            background: theme === 'light' ? '#6d28d9' : '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Logout
        </button>
      </div>

      {/* Main ChatPage Component */}
      <div style={{ flex: 1 }}>
        <ChatPage />
      </div>
    </div>
  );
}
