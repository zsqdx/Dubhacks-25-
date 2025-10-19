import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './App';
import { Lightbulb, BookOpen, MessageSquare, Send, Plus } from 'lucide-react';
import Navbar from './Navbar';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
  type?: 'text' | 'code' | 'insight';
  metadata?: {
    course?: string;
    topic?: string;
    confidence?: number;
  };
}

interface QuickPrompt {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const ChatPage: React.FC = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI tutor powered by AWS Bedrock. I can help you understand concepts, work through problems, and create personalized study plans based on your Canvas courses. What would you like to work on today?",
      isAI: true,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const c = {
    dark: {
      bg: '#0a0a0a',
      sidebarBg: '#141414',
      text: '#f3f4f6',
      textSecondary: '#9ca3af',
      accent: '#8b5cf6',
      cardBg: '#1a1a1a',
      border: '#2d2d2d',
      aiBg: '#1c1c1c',
    },
    light: {
      bg: '#f9fafb',
      sidebarBg: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      accent: '#6d28d9',
      cardBg: '#ffffff',
      border: '#e5e7eb',
      aiBg: '#f3f4f6',
    }
  }[theme];

  const quickPrompts: QuickPrompt[] = [
    { id: '1', label: 'Explain concept', icon: <Lightbulb size={15} />, prompt: 'Can you explain ' },
    { id: '2', label: 'Practice problem', icon: <BookOpen size={15} />, prompt: 'Give me a practice problem about ' },
    { id: '3', label: 'Study plan', icon: <MessageSquare size={15} />, prompt: 'Create a study plan for ' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isAI: false,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Let's review "${input}". Based on your Canvas progress, this ties into CS 201 – Data Structures. Here's a simplified explanation...`,
        isAI: true,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1400);
  };

  return (
    <div style={{ background: c.bg, minHeight: '100vh' }}>
      <Navbar />

      <div style={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
      }}>
        {/* Sidebar */}
        {showSidebar && (
          <aside style={{
            width: '260px',
            background: c.sidebarBg,
            borderRight: `1px solid ${c.border}`,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{
              fontSize: '13px',
              color: c.textSecondary,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Quick Prompts</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickPrompts.map(p => (
                <button
                  key={p.id}
                  onClick={() => setInput(p.prompt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    background: c.cardBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: c.text,
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = c.accent)}
                  onMouseOut={e => (e.currentTarget.style.borderColor = c.border)}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>

            <button
              style={{
                marginTop: 'auto',
                padding: '10px',
                background: c.accent,
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onClick={() => setMessages([
                {
                  id: '1',
                  text: 'Starting a new session. What topic would you like to review today?',
                  isAI: true,
                  timestamp: new Date(),
                  type: 'text'
                }
              ])}
            >
              <Plus size={15} /> New Chat
            </button>
          </aside>
        )}

        {/* Chat Area */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Chat Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '30px 20px'
          }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.isAI ? 'flex-start' : 'flex-end',
                    marginBottom: '18px'
                  }}
                >
                  <div
                    style={{
                      background: msg.isAI ? c.aiBg : c.accent,
                      color: msg.isAI ? c.text : 'white',
                      borderRadius: msg.isAI ? '6px 14px 14px 14px' : '14px 6px 14px 14px',
                      padding: '12px 16px',
                      maxWidth: '70%',
                      lineHeight: 1.5,
                      boxShadow: msg.isAI ? 'none' : '0 2px 10px rgba(139,92,246,0.25)'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: c.textSecondary,
                  fontSize: '13px'
                }}>
                  <span>AI Tutor is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div style={{
            borderTop: `1px solid ${c.border}`,
            background: c.sidebarBg,
            padding: '16px 20px'
          }}>
            <div style={{
              display: 'flex',
              maxWidth: '800px',
              margin: '0 auto',
              background: c.cardBg,
              border: `1px solid ${c.border}`,
              borderRadius: '10px',
              padding: '4px'
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question or request a practice problem..."
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: c.text,
                  padding: '10px 12px',
                  fontSize: '14px',
                  resize: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  background: input.trim() ? c.accent : c.cardBg,
                  color: input.trim() ? '#fff' : c.textSecondary,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: input.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
