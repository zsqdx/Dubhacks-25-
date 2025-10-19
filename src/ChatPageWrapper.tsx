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
    light: { bg: '#f9fafb', text: '#111827', border: '#e5e7eb' },
    dark: { bg: '#0a0a0a', text: '#f3f4f6', border: '#2d2d2d' },
  };
  const c = colors[theme];

  return (
    <div
      style={{
        height: '100vh',
        background: c.bg,
        color: c.text,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar onLogout={onLogout} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatPage user={user} />
      </div>
    </div>
  );
}
