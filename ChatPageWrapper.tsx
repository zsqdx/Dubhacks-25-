import React from 'react';
import Navigation from './Navigation';
import ChatPage from './ChatPage';

interface ChatPageWrapperProps {
  user: any;
  onLogout: () => void;
}

export default function ChatPageWrapper({ user, onLogout }: ChatPageWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navigation user={user} onLogout={onLogout} />
      <ChatPage />
    </div>
  );
}
